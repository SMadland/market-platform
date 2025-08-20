#!/bin/bash

# Build script for iOS IPA
# Usage: ./scripts/build-ios.sh [debug|release]

set -e

BUILD_TYPE=${1:-release}

echo "🚀 Building iOS app..."
echo "Build type: $BUILD_TYPE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    echo -e "${RED}❌ Error: capacitor.config.ts not found. Run this script from the project root.${NC}"
    exit 1
fi

# Check if iOS platform exists
if [ ! -d "ios" ]; then
    echo -e "${YELLOW}⚠️  iOS platform not found. Adding iOS platform...${NC}"
    npx cap add ios
fi

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ Error: iOS builds require macOS and Xcode.${NC}"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Error: Xcode command line tools not found. Please install Xcode.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building web assets...${NC}"
npm run build

echo -e "${YELLOW}🔄 Syncing with Capacitor...${NC}"
npx cap sync ios

echo -e "${YELLOW}📱 Building iOS app...${NC}"

# Set build configuration
if [ "$BUILD_TYPE" = "release" ]; then
    CONFIGURATION="Release"
    echo -e "${YELLOW}🔐 Building for App Store distribution...${NC}"
else
    CONFIGURATION="Debug"
    echo -e "${YELLOW}🔧 Building debug version...${NC}"
fi

# Build the iOS app
cd ios/App

# Clean build folder
echo -e "${YELLOW}🧹 Cleaning build folder...${NC}"
xcodebuild clean -workspace App.xcworkspace -scheme App

if [ "$BUILD_TYPE" = "release" ]; then
    # Archive for App Store
    echo -e "${YELLOW}📦 Creating archive...${NC}"
    xcodebuild archive \
        -workspace App.xcworkspace \
        -scheme App \
        -configuration $CONFIGURATION \
        -archivePath build/App.xcarchive \
        -allowProvisioningUpdates

    # Export IPA
    echo -e "${YELLOW}📤 Exporting IPA...${NC}"
    xcodebuild -exportArchive \
        -archivePath build/App.xcarchive \
        -exportPath build \
        -exportOptionsPlist ExportOptions.plist

    echo -e "${GREEN}✅ Release IPA built successfully!${NC}"
    echo -e "${GREEN}📍 Location: ios/App/build/App.ipa${NC}"
else
    # Build for simulator/device testing
    xcodebuild build \
        -workspace App.xcworkspace \
        -scheme App \
        -configuration $CONFIGURATION \
        -destination 'generic/platform=iOS'

    echo -e "${GREEN}✅ Debug build completed!${NC}"
    echo -e "${GREEN}📍 Use Xcode to install on device or simulator${NC}"
fi

cd ../..

echo -e "${GREEN}🎉 iOS build completed!${NC}"

# Show next steps
echo -e "\n${YELLOW}📋 Next steps:${NC}"
if [ "$BUILD_TYPE" = "release" ]; then
    echo "1. Test the IPA on TestFlight"
    echo "2. Upload to App Store Connect"
    echo "3. Fill out app information"
    echo "4. Submit for review"
else
    echo "1. Open ios/App/App.xcworkspace in Xcode"
    echo "2. Run on device or simulator"
    echo "3. Test all functionality"
fi

echo -e "\n${YELLOW}⚠️  Important:${NC}"
echo "- Make sure you have valid certificates and provisioning profiles"
echo "- Test on multiple devices and iOS versions"
echo "- Verify all permissions work correctly"
echo "- Test deep linking and URL schemes"