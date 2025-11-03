# Monitoring & Analytics - Post-Deployment

Deze guide behandelt monitoring, crash reporting en analytics voor de DKL Steps App na deployment, gebaseerd op de daadwerkelijke implementatie met Expo en React Native.

## 📋 Overzicht

Monitoring is cruciaal voor het identificeren van problemen, begrijpen van gebruikersgedrag en het nemen van datagestuurde beslissingen voor verbeteringen.

---

## 🚨 Crash Reporting & Error Tracking

### Sentry Integration

**Installatie:**
```bash
npx expo install sentry-expo
```

**Configuratie in `app.json`:**
```json
{
  "expo": {
    "plugins": [
      [
        "sentry-expo",
        {
          "url": "https://sentry.io/",
          "project": "dkl-steps-app",
          "organization": "dkl-organization"
        }
      ]
    ]
  }
}
```

**Initialisatie in code:**
```typescript
// App.tsx
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'YOUR_DSN_HERE',
  enableInExpoDevelopment: true,
  debug: __DEV__,
});

// Wrap app met ErrorBoundary
export default function App() {
  return (
    <Sentry.Native.ErrorBoundary fallback={ErrorFallback}>
      <AppContent />
    </Sentry.Native.ErrorBoundary>
  );
}
```

### Firebase Crashlytics (Alternatief)

**Installatie:**
```bash
npx expo install @react-native-firebase/app @react-native-firebase/crashlytics
```

**Configuratie:**
```typescript
// lib/firebase.ts
import crashlytics from '@react-native-firebase/crashlytics';

export const initializeCrashlytics = async () => {
  await crashlytics().setCrashlyticsCollectionEnabled(true);
};

// Usage in App.tsx
import { initializeCrashlytics } from './lib/firebase';

initializeCrashlytics();
```

---

## 📊 Analytics & Usage Tracking

### Firebase Analytics

**Installatie:**
```bash
npx expo install @react-native-firebase/analytics expo-firebase-analytics
```

**Implementatie:**
```typescript
// lib/analytics.ts
import analytics from '@react-native-firebase/analytics';

export const trackEvent = async (eventName: string, parameters?: Record<string, any>) => {
  try {
    await analytics().logEvent(eventName, {
      ...parameters,
      app_version: Constants.expoConfig?.version,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const trackScreen = async (screenName: string) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (error) {
    console.error('Screen tracking error:', error);
  }
};
```

**Gebruik in componenten:**
```typescript
// screens/DashboardScreen.tsx
import { useFocusEffect } from '@react-navigation/native';
import { trackScreen, trackEvent } from '../lib/analytics';

export default function DashboardScreen() {
  useFocusEffect(() => {
    trackScreen('Dashboard');
  });

  const handleStepSync = async () => {
    trackEvent('step_sync_started', { step_count: currentSteps });
    // ... sync logic
    trackEvent('step_sync_completed', { success: true, synced_steps: syncedCount });
  };

  return (
    // ... component JSX
  );
}
```

### Expo Analytics (Built-in)

**Voor basis tracking:**
```typescript
// lib/expo-analytics.ts
import { Analytics } from 'expo-analytics';

const analytics = new Analytics('YOUR_EXPO_ANALYTICS_ID');

export const trackExpoEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties);
};
```

---

## 📈 Key Metrics to Track

### User Engagement Metrics

```typescript
// Track app opens
trackEvent('app_open', {
  cold_start: true,
  previous_version: await AsyncStorage.getItem('last_version'),
});

// Track session duration
trackEvent('session_start');
trackEvent('session_end', { duration_minutes: sessionDuration });

// Track feature usage
trackEvent('pedometer_permission_granted');
trackEvent('step_sync_performed', { step_count: 150 });
trackEvent('geofence_entered', { location: 'event_area' });
```

### Performance Metrics

```typescript
// Track API response times
const startTime = Date.now();
const response = await api.getSteps();
const responseTime = Date.now() - startTime;

trackEvent('api_response_time', {
  endpoint: 'get_steps',
  response_time_ms: responseTime,
  success: response.ok,
});

// Track app startup time
trackEvent('app_startup_time', {
  startup_time_ms: startupDuration,
  cold_start: isColdStart,
});
```

### Error & Crash Metrics

```typescript
// Track handled errors
trackEvent('error_occurred', {
  error_type: 'network_error',
  error_message: error.message,
  screen: currentScreen,
  user_id: user?.id,
});

// Track unhandled promise rejections
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  trackEvent('unhandled_error', {
    error_message: error.message,
    error_stack: error.stack,
    is_fatal: isFatal,
    screen: currentScreen,
  });

  originalHandler?.(error, isFatal);
});
```

### Business Metrics

```typescript
// Track beta testing progress
trackEvent('beta_milestone_reached', {
  milestone: '1000_steps_logged',
  user_type: 'participant',
});

// Track conversion funnels
trackEvent('login_completed');
trackEvent('first_steps_synced');
trackEvent('profile_completed');
```

---

## 📱 Real-Time Monitoring Dashboard

### Custom Dashboard met React Query

```typescript
// hooks/useMonitoringData.ts
import { useQuery } from '@tanstack/react-query';

export const useMonitoringData = () => {
  return useQuery({
    queryKey: ['monitoring'],
    queryFn: async () => {
      const [analytics, crashes, performance] = await Promise.all([
        fetch('/api/analytics/summary'),
        fetch('/api/crashes/recent'),
        fetch('/api/performance/metrics'),
      ]);

      return {
        analytics: await analytics.json(),
        crashes: await crashes.json(),
        performance: await performance.json(),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};
```

### Monitoring Screen voor Admins

```typescript
// screens/MonitoringScreen.tsx
import { useMonitoringData } from '../hooks/useMonitoringData';

export default function MonitoringScreen() {
  const { data, isLoading } = useMonitoringData();

  if (isLoading) return <LoadingSpinner />;

  return (
    <ScrollView>
      <MetricCard
        title="Active Users (24h)"
        value={data.analytics.activeUsers24h}
        trend={data.analytics.userTrend}
      />

      <MetricCard
        title="Crash Rate"
        value={`${data.crashes.rate}%`}
        trend={data.crashes.trend}
      />

      <MetricCard
        title="Avg Response Time"
        value={`${data.performance.avgResponseTime}ms`}
        trend={data.performance.responseTrend}
      />

      <RecentCrashesList crashes={data.crashes.recent} />
      <PerformanceChart data={data.performance.chartData} />
    </ScrollView>
  );
}
```

---

## 🔍 A/B Testing Framework

### Feature Flags Implementation

```typescript
// lib/featureFlags.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FEATURE_FLAGS = {
  NEW_DASHBOARD: 'new_dashboard_ui',
  ENHANCED_SYNC: 'enhanced_sync_algorithm',
  PUSH_NOTIFICATIONS: 'push_notifications',
} as const;

export const getFeatureFlag = async (flag: keyof typeof FEATURE_FLAGS): Promise<boolean> => {
  try {
    const flags = await AsyncStorage.getItem('feature_flags');
    const parsed = flags ? JSON.parse(flags) : {};
    return parsed[flag] ?? false;
  } catch {
    return false;
  }
};

export const setFeatureFlag = async (flag: keyof typeof FEATURE_FLAGS, enabled: boolean) => {
  try {
    const flags = await AsyncStorage.getItem('feature_flags');
    const parsed = flags ? JSON.parse(flags) : {};
    parsed[flag] = enabled;
    await AsyncStorage.setItem('feature_flags', JSON.stringify(parsed));

    // Track feature flag changes
    trackEvent('feature_flag_changed', {
      flag,
      enabled,
      user_segment: getUserSegment(),
    });
  } catch (error) {
    console.error('Feature flag error:', error);
  }
};
```

### A/B Test Implementation

```typescript
// lib/abTesting.ts
export const AB_TESTS = {
  DASHBOARD_VARIANT: 'dashboard_ui_test',
  SYNC_FREQUENCY: 'sync_frequency_test',
} as const;

export const getABTestVariant = async (test: keyof typeof AB_TESTS): Promise<'A' | 'B'> => {
  // Simple random assignment (in production, use proper A/B testing service)
  const stored = await AsyncStorage.getItem(`ab_test_${test}`);
  if (stored) return stored as 'A' | 'B';

  const variant = Math.random() < 0.5 ? 'A' : 'B';
  await AsyncStorage.setItem(`ab_test_${test}`, variant);

  trackEvent('ab_test_assigned', {
    test_name: test,
    variant,
    user_id: user?.id,
  });

  return variant;
};
```

### Usage in Components

```typescript
// components/Dashboard.tsx
import { getABTestVariant, FEATURE_FLAGS, getFeatureFlag } from '../lib/abTesting';

export default function Dashboard() {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [newDashboardEnabled, setNewDashboardEnabled] = useState(false);

  useEffect(() => {
    const initializeTests = async () => {
      const testVariant = await getABTestVariant('DASHBOARD_VARIANT');
      const featureEnabled = await getFeatureFlag('NEW_DASHBOARD');

      setVariant(testVariant);
      setNewDashboardEnabled(featureEnabled);
    };

    initializeTests();
  }, []);

  // Track which variant user sees
  useEffect(() => {
    trackEvent('dashboard_viewed', {
      variant,
      new_dashboard: newDashboardEnabled,
    });
  }, [variant, newDashboardEnabled]);

  if (newDashboardEnabled) {
    return <NewDashboard />;
  }

  return variant === 'A' ? <DashboardA /> : <DashboardB />;
}
```

---

## 📊 Beta Testing Analytics

### Tester Segmentation

```typescript
// lib/userSegmentation.ts
export const getUserSegment = (): string => {
  // Based on installation source, device type, etc.
  if (Platform.OS === 'ios') return 'ios_tester';
  if (Platform.OS === 'android') return 'android_tester';

  // Check if from TestFlight
  if (Constants.expoConfig?.ios?.bundleIdentifier?.includes('beta')) {
    return 'testflight_beta';
  }

  // Check if from Play Store beta
  if (Constants.expoConfig?.android?.package?.includes('beta')) {
    return 'playstore_beta';
  }

  return 'direct_download';
};
```

### Beta Feedback Collection

```typescript
// components/BetaFeedbackModal.tsx
import { trackEvent } from '../lib/analytics';

export default function BetaFeedbackModal({ visible, onClose }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const submitFeedback = async () => {
    trackEvent('beta_feedback_submitted', {
      rating,
      feedback_length: feedback.length,
      has_suggestions: feedback.length > 0,
      user_segment: getUserSegment(),
      app_version: Constants.expoConfig?.version,
    });

    // Send to backend
    await api.submitBetaFeedback({ rating, feedback });

    onClose();
  };

  return (
    <Modal visible={visible}>
      <View>
        <Text>Rate your beta experience:</Text>
        <StarRating value={rating} onChange={setRating} />

        <TextInput
          placeholder="Any feedback or suggestions?"
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />

        <Button title="Submit" onPress={submitFeedback} />
      </View>
    </Modal>
  );
}
```

---

## 🚨 Alert System

### Performance Alerts

```typescript
// lib/alerts.ts
export const checkPerformanceAlerts = async () => {
  const metrics = await api.getPerformanceMetrics();

  if (metrics.crashRate > 0.05) { // 5% crash rate
    await sendAlert('High Crash Rate', `Crash rate is ${metrics.crashRate}%`);
  }

  if (metrics.avgResponseTime > 5000) { // 5 second response time
    await sendAlert('Slow API Responses', `Average response time: ${metrics.avgResponseTime}ms`);
  }

  if (metrics.activeUsers < 10) { // Low engagement
    await sendAlert('Low User Engagement', `Only ${metrics.activeUsers} active users`);
  }
};

const sendAlert = async (title: string, message: string) => {
  // Send to Slack, email, etc.
  await fetch('/api/alerts', {
    method: 'POST',
    body: JSON.stringify({ title, message }),
  });
};
```

### Automated Alert Checks

```typescript
// In CI/CD workflow (.github/workflows/alerts.yml)
name: Daily Monitoring Alerts
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM
  workflow_dispatch:

jobs:
  check-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Check performance metrics
        run: |
          # Call monitoring API
          curl -X POST ${{ secrets.MONITORING_WEBHOOK }} \
            -H "Content-Type: application/json" \
            -d '{"action": "check_alerts"}'
```

---

## 📈 Data Export & Reporting

### Analytics Data Export

```typescript
// lib/dataExport.ts
export const exportAnalyticsData = async (startDate: Date, endDate: Date) => {
  const data = await api.getAnalyticsExport({
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });

  // Convert to CSV
  const csv = convertToCSV(data);

  // Share file
  await Sharing.shareAsync(csv, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Analytics Data',
  });
};

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    )
  ];

  return csvRows.join('\n');
};
```

### Weekly Reports

```typescript
// Automated weekly report generation
export const generateWeeklyReport = async () => {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const metrics = await api.getWeeklyMetrics(lastWeek);

  const report = {
    period: `${lastWeek.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`,
    total_users: metrics.totalUsers,
    active_users: metrics.activeUsers,
    total_steps: metrics.totalSteps,
    avg_session_time: metrics.avgSessionTime,
    crash_rate: metrics.crashRate,
    top_crashes: metrics.topCrashes,
    user_feedback: metrics.feedback,
  };

  // Send report via email
  await api.sendWeeklyReport(report);

  return report;
};
```

---

## 🔒 Privacy & Compliance

### Data Collection Transparency

```typescript
// components/PrivacySettings.tsx
export default function PrivacySettings() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashReportingEnabled, setCrashReportingEnabled] = useState(true);

  const updatePrivacySettings = async () => {
    await AsyncStorage.setItem('privacy_settings', JSON.stringify({
      analytics: analyticsEnabled,
      crash_reporting: crashReportingEnabled,
    }));

    // Update analytics/crash reporting accordingly
    if (!analyticsEnabled) {
      await analytics().setAnalyticsCollectionEnabled(false);
    }

    if (!crashReportingEnabled) {
      await crashlytics().setCrashlyticsCollectionEnabled(false);
    }

    trackEvent('privacy_settings_updated', {
      analytics_enabled: analyticsEnabled,
      crash_reporting_enabled: crashReportingEnabled,
    });
  };

  return (
    <View>
      <Text>Privacy Settings</Text>

      <SwitchRow
        title="Analytics & Usage Tracking"
        subtitle="Help us improve the app by sharing anonymous usage data"
        value={analyticsEnabled}
        onValueChange={setAnalyticsEnabled}
      />

      <SwitchRow
        title="Crash Reporting"
        subtitle="Automatically report crashes to help fix bugs"
        value={crashReportingEnabled}
        onValueChange={setCrashReportingEnabled}
      />

      <Button title="Update Settings" onPress={updatePrivacySettings} />
    </View>
  );
}
```

### GDPR Compliance

```typescript
// lib/gdpr.ts
export const handleDataDeletion = async (userId: string) => {
  // Delete user data from analytics
  await analytics().resetAnalyticsData();

  // Delete user data from crash reporting
  await crashlytics().deleteUnsentReports();

  // Delete from custom analytics
  await api.deleteUserAnalytics(userId);

  // Clear local data
  await AsyncStorage.clear();

  trackEvent('gdpr_data_deleted', { user_id: userId });
};
```

---

## 📊 Dashboard Integrations

### External Monitoring Tools

**DataDog Integration:**
```typescript
// lib/datadog.ts
import { DatadogProvider, DdLogs } from '@datadog/mobile-react-native';

export const initializeDatadog = () => {
  DatadogProvider.initialize({
    clientToken: 'YOUR_CLIENT_TOKEN',
    applicationId: 'YOUR_APP_ID',
    env: __DEV__ ? 'development' : 'production',
  });
};

// Usage
DdLogs.info('App started', { version: Constants.expoConfig?.version });
```

**New Relic Integration:**
```typescript
// lib/newrelic.ts
import { NewRelic } from '@newrelic/react-native-agent-newrelic';

NewRelic.startAgent('YOUR_APP_TOKEN', {
  crashReportingEnabled: true,
  analyticsEventEnabled: true,
  networkRequestEnabled: true,
});
```

---

## 🎯 Success Metrics voor Beta

### Quantitative Metrics

- **Crash-free Users**: > 95%
- **App Startup Time**: < 3 seconden
- **Step Sync Success Rate**: > 98%
- **User Retention (7 dagen)**: > 70%
- **Daily Active Users**: Groeiende trend

### Qualitative Metrics

- **User Satisfaction Score**: > 4.0/5.0
- **Bug Report Volume**: Afnemende trend
- **Feature Request Completion**: > 80%
- **Support Ticket Resolution**: < 24 uur

---

## 🔗 Gerelateerde Documentatie

- **[`BETA_DEPLOYMENT.md`](BETA_DEPLOYMENT.md)** - Beta deployment procedures
- **[`CI_CD.md`](CI_CD.md)** - Automated deployment pipelines
- **[`PRODUCTION_TRANSITION.md`](PRODUCTION_TRANSITION.md)** - Beta naar production
- **[`CHANGELOG.md`](../04-reference/CHANGELOG.md)** - Version tracking

---

**Laatste Update**: November 2025
**Analytics Focus**: Privacy-compliant, actionable insights