#!/bin/bash

# Build script for Android APK/AAB
# Usage: ./scripts/build-android.sh [debug|release] [apk|aab]

set -e

BUILD_TYPE=${1:-release}
OUTPUT_TYPE=${2:-aab}

echo "🚀 Building Android app..."
echo "Build type: $BUILD_TYPE"
echo "Output type: $OUTPUT_TYPE"

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

# Check if Android platform exists
if [ ! -d "android" ]; then
    echo -e "${YELLOW}⚠️  Android platform not found. Adding Android platform...${NC}"
    npx cap add android
fi

echo -e "${YELLOW}📦 Building web assets...${NC}"
npm run build

echo -e "${YELLOW}🔄 Syncing with Capacitor...${NC}"
npx cap sync android

echo -e "${YELLOW}📱 Building Android $OUTPUT_TYPE ($BUILD_TYPE)...${NC}"
cd android

if [ "$BUILD_TYPE" = "release" ]; then
    if [ "$OUTPUT_TYPE" = "aab" ]; then
        ./gradlew bundleRelease
        echo -e "${GREEN}✅ Release AAB built successfully!${NC}"
        echo -e "${GREEN}📍 Location: android/app/build/outputs/bundle/release/app-release.aab${NC}"
    else
        ./gradlew assembleRelease
        echo -e "${GREEN}✅ Release APK built successfully!${NC}"
        echo -e "${GREEN}📍 Location: android/app/build/outputs/apk/release/app-release.apk${NC}"
    fi
else
    if [ "$OUTPUT_TYPE" = "aab" ]; then
        ./gradlew bundleDebug
        echo -e "${GREEN}✅ Debug AAB built successfully!${NC}"
        echo -e "${GREEN}📍 Location: android/app/build/outputs/bundle/debug/app-debug.aab${NC}"
    else
        ./gradlew assembleDebug
        echo -e "${GREEN}✅ Debug APK built successfully!${NC}"
        echo -e "${GREEN}📍 Location: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
    fi
fi

cd ..

echo -e "${GREEN}🎉 Android build completed!${NC}"

# Show next steps
echo -e "\n${YELLOW}📋 Next steps:${NC}"
if [ "$BUILD_TYPE" = "release" ]; then
    echo "1. Test the $OUTPUT_TYPE on a physical device"
    echo "2. Upload to Google Play Console"
    echo "3. Fill out store listing information"
    echo "4. Submit for review"
else
    echo "1. Install on device: adb install android/app/build/outputs/apk/debug/app-debug.apk"
    echo "2. Test all functionality"
fi

echo -e "\n${YELLOW}⚠️  Important:${NC}"
echo "- Make sure you have configured signing for release builds"
echo "- Test on multiple devices and Android versions"
echo "- Verify all permissions work correctly"