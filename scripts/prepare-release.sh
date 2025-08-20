#!/bin/bash

# Script to prepare app for release
# Updates version numbers and checks for common issues

set -e

VERSION=${1}

if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/prepare-release.sh <version>"
    echo "Example: ./scripts/prepare-release.sh 1.0.1"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Preparing release version $VERSION${NC}"

# Extract version parts
IFS='.' read -ra VERSION_PARTS <<< "$VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Calculate version code (for Android)
VERSION_CODE=$((MAJOR * 10000 + MINOR * 100 + PATCH))

echo -e "${YELLOW}📝 Updating version numbers...${NC}"

# Update package.json
echo -e "${YELLOW}  → package.json${NC}"
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json

# Update Android version
echo -e "${YELLOW}  → Android build.gradle${NC}"
if [ -f "android/app/build.gradle" ]; then
    sed -i.bak "s/versionCode [0-9]*/versionCode $VERSION_CODE/" android/app/build.gradle
    sed -i.bak "s/versionName \".*\"/versionName \"$VERSION\"/" android/app/build.gradle
fi

# Update iOS version
echo -e "${YELLOW}  → iOS Info.plist${NC}"
if [ -f "ios/App/App/Info.plist" ]; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" ios/App/App/Info.plist
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION_CODE" ios/App/App/Info.plist
fi

echo -e "${GREEN}✅ Version numbers updated${NC}"

# Run checks
echo -e "${YELLOW}🔍 Running pre-release checks...${NC}"

# Check for TODO comments
echo -e "${YELLOW}  → Checking for TODO comments...${NC}"
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" src/ --exclude-dir=node_modules || true | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    echo -e "${YELLOW}    ⚠️  Found $TODO_COUNT TODO/FIXME comments${NC}"
    grep -r "TODO\|FIXME\|XXX" src/ --exclude-dir=node_modules || true
else
    echo -e "${GREEN}    ✅ No TODO comments found${NC}"
fi

# Check for console.log statements
echo -e "${YELLOW}  → Checking for console.log statements...${NC}"
CONSOLE_COUNT=$(grep -r "console\." src/ --exclude-dir=node_modules || true | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
    echo -e "${YELLOW}    ⚠️  Found $CONSOLE_COUNT console statements${NC}"
    echo -e "${YELLOW}    Consider removing or replacing with proper logging${NC}"
else
    echo -e "${GREEN}    ✅ No console statements found${NC}"
fi

# Check for environment variables
echo -e "${YELLOW}  → Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}    ❌ .env file not found${NC}"
else
    echo -e "${GREEN}    ✅ .env file exists${NC}"
fi

# Check build
echo -e "${YELLOW}  → Testing build...${NC}"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}    ✅ Build successful${NC}"
else
    echo -e "${RED}    ❌ Build failed${NC}"
    exit 1
fi

# Check for large files
echo -e "${YELLOW}  → Checking for large files...${NC}"
LARGE_FILES=$(find dist/ -size +1M -type f 2>/dev/null || true)
if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}    ⚠️  Large files found:${NC}"
    echo "$LARGE_FILES"
else
    echo -e "${GREEN}    ✅ No large files found${NC}"
fi

# Clean up backup files
rm -f package.json.bak
rm -f android/app/build.gradle.bak

echo -e "${GREEN}🎉 Release preparation completed!${NC}"
echo -e "\n${YELLOW}📋 Next steps:${NC}"
echo "1. Review and commit version changes"
echo "2. Create git tag: git tag v$VERSION"
echo "3. Build release: ./scripts/build-android.sh release aab"
echo "4. Build iOS: ./scripts/build-ios.sh release"
echo "5. Test on devices"
echo "6. Upload to app stores"

echo -e "\n${YELLOW}⚠️  Remember to:${NC}"
echo "- Update release notes"
echo "- Test on multiple devices"
echo "- Verify all features work"
echo "- Check app store guidelines compliance"