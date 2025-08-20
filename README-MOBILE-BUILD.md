# 📱 Mobile App Build Guide

Dette dokumentet forklarer hvordan du bygger Mamon-appen for Android og iOS app stores.

## 🚀 Hurtigstart

### Android (APK/AAB)
```bash
# Bygg release AAB for Play Store
./scripts/build-android.sh release aab

# Bygg debug APK for testing
./scripts/build-android.sh debug apk
```

### iOS (IPA)
```bash
# Bygg release IPA for App Store
./scripts/build-ios.sh release

# Bygg debug versjon
./scripts/build-ios.sh debug
```

## 📋 Forutsetninger

### Generelt
- Node.js 18+ installert
- Capacitor CLI: `npm install -g @capacitor/cli`
- Alle npm dependencies installert: `npm install`

### Android
- Android Studio installert
- Android SDK (API level 24+)
- Java 8+ installert
- For release builds: Keystore konfigurert

### iOS
- macOS med Xcode installert
- iOS SDK 13.0+
- Apple Developer Account
- Gyldig sertifikat og provisioning profile

## 🔧 Konfigurering før bygging

### 1. Android Signing (Release)

Opprett keystore:
```bash
keytool -genkey -v -keystore mamon-release-key.keystore -alias mamon -keyalg RSA -keysize 2048 -validity 10000
```

Oppdater `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        keyAlias 'mamon'
        keyPassword 'your-key-password'
        storeFile file('../mamon-release-key.keystore')
        storePassword 'your-store-password'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // ... resten av konfigurasjonen
    }
}
```

### 2. iOS Certificates

1. Logg inn på Apple Developer Portal
2. Opprett App ID: `no.mamon.app`
3. Opprett Distribution Certificate
4. Opprett Provisioning Profile for App Store
5. Last ned og installer i Xcode

Oppdater `ios/App/ExportOptions.plist`:
```xml
<key>teamID</key>
<string>DIN_TEAM_ID</string>
<key>provisioningProfiles</key>
<dict>
    <key>no.mamon.app</key>
    <string>DITT_PROVISIONING_PROFILE_NAVN</string>
</dict>
```

## 📦 Build Prosess

### Android

1. **Forbered web assets**
   ```bash
   npm run build
   ```

2. **Sync med Capacitor**
   ```bash
   npx cap sync android
   ```

3. **Bygg APK/AAB**
   ```bash
   cd android
   ./gradlew bundleRelease  # For AAB
   ./gradlew assembleRelease  # For APK
   ```

### iOS

1. **Forbered web assets**
   ```bash
   npm run build
   ```

2. **Sync med Capacitor**
   ```bash
   npx cap sync ios
   ```

3. **Bygg i Xcode**
   ```bash
   cd ios/App
   xcodebuild archive -workspace App.xcworkspace -scheme App -configuration Release -archivePath build/App.xcarchive
   xcodebuild -exportArchive -archivePath build/App.xcarchive -exportPath build -exportOptionsPlist ExportOptions.plist
   ```

## 🏪 App Store Publisering

### Google Play Store

1. **Opprett app i Play Console**
   - Gå til [Google Play Console](https://play.google.com/console)
   - Opprett ny app med navn "Mamon"
   - Velg kategori: "Social"

2. **Last opp AAB**
   - Gå til "Release" → "Production"
   - Last opp `app-release.aab`
   - Fyll ut release notes

3. **Konfigurer app listing**
   - App navn: "Mamon"
   - Kort beskrivelse: "Del favorittopplevelser med venner"
   - Full beskrivelse: Se `android/app/src/main/res/values/strings.xml`
   - Screenshots: Minimum 2 telefon, 1 tablet
   - Ikon: 512x512 PNG

4. **Innholdsvurdering**
   - Velg "Social networking"
   - Svar på spørsmål om innhold

### Apple App Store

1. **Opprett app i App Store Connect**
   - Gå til [App Store Connect](https://appstoreconnect.apple.com)
   - Opprett ny app med Bundle ID: `no.mamon.app`
   - Velg kategori: "Social Networking"

2. **Last opp IPA**
   - Bruk Xcode eller Application Loader
   - Last opp `App.ipa`

3. **Konfigurer app informasjon**
   - App navn: "Mamon"
   - Undertittel: "Del favorittopplevelser"
   - Beskrivelse: Se app beskrivelse
   - Nøkkelord: "anbefaling, tips, sosial, shopping"
   - Screenshots: Minimum 3 per enhet

4. **Send inn for review**
   - Velg "Manual Release"
   - Send inn for review

## ⚠️ Potensielle avslag og løsninger

### 1. WebView Problemer

**Problem**: App stores kan avvise apper som kun er WebView-wrappere.

**Løsning**:
- ✅ Implementert: Native splash screen
- ✅ Implementert: Native navigation bar
- ✅ Implementert: Native permissions
- 🔄 Anbefalt: Legg til native push notifications
- 🔄 Anbefalt: Legg til native kamera integration

### 2. Permissions

**Problem**: Unødvendige eller dårlig forklarte permissions.

**Løsning**:
- ✅ Implementert: Klare permission descriptions
- ✅ Implementert: Kun nødvendige permissions
- ⚠️ Sjekk: Fjern unused permissions før release

### 3. Network Security

**Problem**: Usikre nettverksforbindelser.

**Løsning**:
- ✅ Implementert: HTTPS-only for produksjon
- ✅ Implementert: Network Security Config (Android)
- ✅ Implementert: App Transport Security (iOS)

### 4. Deep Linking

**Problem**: Manglende eller feil URL scheme handling.

**Løsning**:
- ✅ Implementert: Custom URL schemes
- ✅ Implementert: Associated domains
- ⚠️ Test: Verifiser at alle deep links fungerer

### 5. Privacy

**Problem**: Manglende privacy policy eller data handling info.

**Løsning**:
- 🔄 Påkrevd: Legg til privacy policy URL
- 🔄 Påkrevd: Oppdater data safety section (Play Store)
- 🔄 Påkrevd: Legg til privacy manifest (iOS)

## 🧪 Testing Checklist

### Før publisering

- [ ] Test på minimum 3 forskjellige enheter
- [ ] Test alle permissions (kamera, lagring)
- [ ] Test deep linking fra eksterne apper
- [ ] Test offline funksjonalitet
- [ ] Test app lifecycle (background/foreground)
- [ ] Verifiser at alle API-kall fungerer
- [ ] Test push notifications (hvis implementert)
- [ ] Sjekk app størrelse (< 100MB anbefalt)
- [ ] Test på laveste støttede OS-versjon

### Performance

- [ ] App starter på < 3 sekunder
- [ ] Smooth scrolling og navigasjon
- [ ] Ingen memory leaks
- [ ] Batteriforbuk er akseptabelt

## 📞 Support

Ved problemer med bygging eller publisering:

1. Sjekk [Capacitor dokumentasjon](https://capacitorjs.com/docs)
2. Se [Android Developer Guide](https://developer.android.com/guide)
3. Se [iOS Developer Guide](https://developer.apple.com/documentation/)
4. Kontakt utviklingsteamet

## 🔄 Versjonering

Oppdater versjonsnummer før hver release:

1. `package.json` → `version`
2. `capacitor.config.ts` → ikke nødvendig
3. `android/app/build.gradle` → `versionCode` og `versionName`
4. `ios/App/App/Info.plist` → `CFBundleShortVersionString` og `CFBundleVersion`

Bruk semantic versioning: `MAJOR.MINOR.PATCH`