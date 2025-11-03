# CI/CD - Continuous Integration & Deployment

Deze guide behandelt geautomatiseerde workflows voor de DKL Steps App deployment pipeline, gebaseerd op GitHub Actions en Expo EAS.

## 📋 Overzicht

Automatisering van builds, testing en deployment om de release cyclus te versnellen en menselijke fouten te verminderen.

---

## 🚀 GitHub Actions Workflows

### 1. Preview Build on Push to `develop`

**Pad**: `.github/workflows/preview-build.yml`

```yaml
name: Preview Build
on:
  push:
    branches: [ develop ]
  pull_request:
    branches: [ develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g eas-cli

      - name: Login to Expo
        run: eas login --access-token ${{ secrets.EXPO_TOKEN }}

      - name: Run tests
        run: npm test -- --coverage --watchAll=false

      - name: Build preview APK
        run: eas build --platform android --profile preview --non-interactive

      - name: Build preview IPA
        run: eas build --platform ios --profile preview --non-interactive

      - name: Comment build URLs
        uses: actions/github-script@v7
        with:
          script: |
            // Script om build URLs te posten als PR comment
```

### 2. Beta Release on Push to `beta`

**Pad**: `.github/workflows/beta-release.yml`

```yaml
name: Beta Release
on:
  push:
    branches: [ beta ]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g eas-cli

      - name: Login to Expo
        run: eas login --access-token ${{ secrets.EXPO_TOKEN }}

      - name: Run full test suite
        run: npm test -- --coverage --watchAll=false

      - name: Build beta APK
        run: eas build --platform android --profile preview --non-interactive

      - name: Build beta IPA
        run: eas build --platform ios --profile production --non-interactive

      - name: Submit to TestFlight
        run: eas submit --platform ios --non-interactive

      - name: Submit to Play Store Beta
        run: eas submit --platform android --non-interactive

      - name: Create GitHub release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: beta-${{ github.run_number }}
          release_name: Beta Release ${{ github.run_number }}
          body: |
            Automated beta release from commit ${{ github.sha }}

            ## Changes
            - See CHANGELOG.md for details

            ## Downloads
            - Android APK: [Build URL will be posted]
            - iOS TestFlight: [Build URL will be posted]
          draft: false
          prerelease: true
```

### 3. Production Release on Tag

**Pad**: `.github/workflows/production-release.yml`

```yaml
name: Production Release
on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g eas-cli

      - name: Login to Expo
        run: eas login --access-token ${{ secrets.EXPO_TOKEN }}

      - name: Run full test suite
        run: npm test -- --coverage --watchAll=false --passWithNoTests

      - name: Build production APK
        run: eas build --platform android --profile production --non-interactive

      - name: Build production IPA
        run: eas build --platform ios --profile production --non-interactive

      - name: Submit to App Store
        run: eas submit --platform ios --non-interactive

      - name: Submit to Play Store
        run: eas submit --platform android --non-interactive

      - name: Create GitHub release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            Production release ${{ github.ref }}

            ## What's New
            - See CHANGELOG.md for full details

            ## Downloads
            - App Store: [iOS App Store Link]
            - Play Store: [Android Play Store Link]
          draft: false
          prerelease: false
```

---

## 🔧 EAS Build Triggers

### Manual Builds (voor development)

```bash
# Preview build voor testing
eas build --platform android --profile preview

# Production build voor stores
eas build --platform android --profile production
```

### Automated Triggers

- **Push to `develop`**: Preview builds voor internal testing
- **Push to `beta`**: Beta releases naar TestFlight & Play Store Beta
- **Tag push (v1.0.0)**: Production releases naar stores

---

## 🌿 Branching Strategy voor OTA Updates

### Branch Structuur

```
main (production)
├── beta (beta releases)
├── develop (development)
│   ├── feature/geofencing
│   ├── feature/analytics
│   └── hotfix/sync-bug
```

### OTA Branch Mapping

```json
// eas.json updates sectie
{
  "updates": {
    "url": "https://u.expo.dev/0f956768-4f43-43bf-8c89-1db197b7bece"
  },
  "runtimeVersion": "1.1.0",
  "branches": {
    "development": {
      "channel": "development"
    },
    "preview": {
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

### OTA Update Commands

```bash
# Update development branch
eas update --branch development --message "New feature: geofencing"

# Update beta branch
eas update --branch preview --message "Bug fix: sync issues"

# Update production branch
eas update --branch production --message "Hotfix: crash on login"
```

---

## 🔐 Secrets Management

### GitHub Secrets (Repository Settings)

```
EXPO_TOKEN=your_expo_access_token
```

### EAS Secrets (voor environment variables)

```bash
# Development secrets
eas secret:create --name BACKEND_URL_DEV --value "https://dev-api.dkl.nl" --scope development

# Production secrets
eas secret:create --name BACKEND_URL_PROD --value "https://api.dkl.nl" --scope production

# Beta secrets
eas secret:create --name BACKEND_URL_BETA --value "https://beta-api.dkl.nl" --scope preview
```

### Environment-Specific Config

```javascript
// In app code
const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'https://fallback-api.dkl.nl';
```

---

## 📊 Build Analytics & Monitoring

### EAS Dashboard Metrics

- Build success/failure rates
- Build queue times
- Download counts per build
- Platform distribution (iOS/Android)

### Custom Analytics Integration

```typescript
// lib/analytics.ts
import { Analytics } from 'expo-analytics';

export const trackBuildEvent = (event: string, properties: Record<string, any>) => {
  Analytics.track(event, {
    ...properties,
    buildVersion: Constants.expoConfig?.version,
    buildProfile: process.env.EXPO_PUBLIC_BUILD_PROFILE,
  });
};

// Usage in app
trackBuildEvent('app_launch', { platform: Platform.OS });
trackBuildEvent('beta_feedback_submitted', { rating: 5 });
```

---

## 🚨 Rollback Procedures

### OTA Rollback

```bash
# Publish rollback update
eas update --branch beta --message "Rollback to v1.0.0" --runtime-version 1.0.0

# Force clear updates cache on device
# (Users moeten app herstarten)
```

### Build Rollback

```bash
# Submit vorige build naar stores
eas submit --platform ios --url "https://expo.dev/artifacts/eas/previous-build-url"

# Of rebuild met vorige commit
git checkout v1.0.0
eas build --platform all --profile production
```

---

## ⚡ Performance Optimalisaties

### Build Speed

```yaml
# .github/workflows/preview-build.yml
- name: Cache EAS build
  uses: actions/cache@v3
  with:
    path: ~/.eas-cache
    key: eas-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

### Parallel Builds

```yaml
# Build Android en iOS tegelijkertijd
jobs:
  build-android:
    runs-on: ubuntu-latest
    # Android build steps

  build-ios:
    runs-on: macos-latest  # iOS builds sneller op macOS
    # iOS build steps
```

---

## 🧪 Testing in CI/CD

### Pre-Build Tests

```yaml
- name: Run unit tests
  run: npm test -- --watchAll=false --coverage

- name: Run E2E tests
  run: npx detox test --configuration android.emu.release

- name: Lint code
  run: npx eslint . --ext .ts,.tsx

- name: Type check
  run: npx tsc --noEmit
```

### Build Validation

```yaml
- name: Validate build artifacts
  run: |
    # Check APK size
    apk_size=$(stat -f%z android/app/build/outputs/apk/release/app-release.apk)
    if [ "$apk_size" -gt 50000000 ]; then
      echo "APK too large: $apk_size bytes"
      exit 1
    fi
```

---

## 📱 Platform-Specific Workflows

### iOS Specific

```yaml
# iOS build alleen op macOS runners
build-ios:
  runs-on: macos-latest
  steps:
    - name: Install Apple certificates
      uses: apple-actions/import-codesign-certs@v2
      with:
        p12-file-base64: ${{ secrets.CERTIFICATES_P12 }}
        p12-password: ${{ secrets.CERTIFICATES_P12_PASSWORD }}

    - name: Install provisioning profile
      uses: apple-actions/import-provisioning-profile@v2
      with:
        provisioning-profile-base64: ${{ secrets.PROVISIONING_PROFILE }}
```

### Android Specific

```yaml
# Android builds op Ubuntu
build-android:
  runs-on: ubuntu-latest
  steps:
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'

    - name: Decode service account key
      run: echo ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }} | base64 -d > google-service-account-key.json
```

---

## 📧 Notifications

### Slack Notifications

```yaml
- name: Notify Slack on build success
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: "Beta build completed successfully! Download: ${{ steps.build.outputs.buildUrl }}"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
  if: success()

- name: Notify Slack on build failure
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: "Build failed! Check logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
  if: failure()
```

### Email Notifications

```yaml
- name: Send email notification
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    to: team@dkl.nl
    subject: Beta Build ${{ job.status }}
    body: |
      Build status: ${{ job.status }}

      Commit: ${{ github.sha }}
      Branch: ${{ github.ref }}

      View logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

---

## 🔄 Update Frequency Guidelines

### Development Branch
- **Daily**: Voor actieve development
- **On-demand**: Voor feature testing

### Beta Branch
- **Weekly**: Voor major features
- **Daily**: Voor hotfixes en bug fixes

### Production Branch
- **Monthly**: Voor regular releases
- **As-needed**: Voor critical hotfixes

---

## 💰 Cost Management

### EAS Pricing Awareness

- **Free Tier**: 30 builds/month, basic support
- **Priority Builds**: $0.05/build voor snellere queues
- **Large Teams**: Custom pricing voor enterprise

### Cost Optimalisatie

```yaml
# Alleen bouwen bij relevante changes
on:
  push:
    branches: [ develop ]
    paths:
      - 'src/**'
      - 'app.json'
      - 'eas.json'
      - 'package.json'
```

---

## 🐛 Troubleshooting CI/CD

### Common Issues

**Build Queue Too Long**
```
Solution: Upgrade to priority builds of bouw alleen bij changes
```

**Expo Token Expired**
```
Solution: Rotate EXPO_TOKEN in GitHub secrets
```

**Certificate Issues (iOS)**
```
Solution: Renew certificates in Apple Developer Console
```

**Service Account Issues (Android)**
```
Solution: Regenerate Google Service Account key
```

---

## 📝 Best Practices

1. **Test Locally First**: Altijd `eas build` lokaal testen voordat CI/CD setup
2. **Version Bumping**: Automatisch version numbers updaten in CI
3. **Changelog Updates**: Forceer CHANGELOG.md updates voor releases
4. **Security**: Gebruik secrets voor alle credentials
5. **Monitoring**: Setup alerts voor build failures
6. **Documentation**: Update deze guide bij workflow changes

---

## 🔗 Gerelateerde Documentatie

- **[`BETA_DEPLOYMENT.md`](BETA_DEPLOYMENT.md)** - Manual deployment procedures
- **[`MONITORING.md`](MONITORING.md)** - Post-deployment monitoring
- **[`PRODUCTION_TRANSITION.md`](PRODUCTION_TRANSITION.md)** - Beta naar production
- **[`CHANGELOG.md`](../04-reference/CHANGELOG.md)** - Version history

---

**Laatste Update**: November 2025
**EAS CLI Version**: 5.9.0+