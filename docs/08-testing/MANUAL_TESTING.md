# 📋 DKL Steps App - Manual Testing Guide

**Project:** DKL Steps Mobile App
**Version:** 1.1.0
**Last Updated:** 26 Oktober 2025
**Status:** ✅ **COMPREHENSIVE MANUAL TEST SUITE**

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Authentication Testing](#authentication-testing)
4. [Step Tracking Testing](#step-tracking-testing)
5. [Geofencing Testing](#geofencing-testing)
6. [Admin Features Testing](#admin-features-testing)
7. [Offline Functionality Testing](#offline-functionality-testing)
8. [UI/UX Testing](#uiux-testing)
9. [Performance Testing](#performance-testing)
10. [Security Testing](#security-testing)
11. [Device Compatibility Testing](#device-compatibility-testing)
12. [Bug Report Templates](#bug-report-templates)
13. [Regression Testing](#regression-testing)

---

## Overview

### Purpose of Manual Testing

Manual testing complements automated tests by validating:
- User experience and usability
- Visual design consistency
- Real device behavior
- Edge cases and error scenarios
- Business logic correctness
- Integration with external services

### Test Coverage Strategy

- **Smoke Tests**: Basic functionality verification
- **Functional Tests**: Feature-specific validation
- **UI/UX Tests**: Design and interaction quality
- **Compatibility Tests**: Device and OS variations
- **Performance Tests**: Speed and resource usage
- **Security Tests**: Data protection and access control

### Test Environment Requirements

- Physical iOS and Android devices
- Various screen sizes (small, medium, large)
- Different OS versions
- Network conditions (WiFi, cellular, offline)
- Location services enabled/disabled
- Step counter permissions granted/denied

---

## Test Environment Setup

### Device Preparation

#### iOS Devices
```bash
# Enable Developer Mode
Settings > Privacy & Security > Developer Mode

# Location Services
Settings > Privacy & Security > Location Services > DKL Steps > Always

# Motion & Fitness
Settings > Privacy & Security > Motion & Fitness > Fitness Tracking > ON

# Background App Refresh
Settings > General > Background App Refresh > DKL Steps > ON
```

#### Android Devices
```bash
# Developer Options (enable first)
Settings > About Phone > Build Number (tap 7 times)

# Location Services
Settings > Location > App permissions > DKL Steps > Allow all the time

# Physical Activity
Settings > Apps > DKL Steps > Permissions > Physical activity > Allow

# Battery Optimization
Settings > Apps > DKL Steps > Battery > Don't optimize
```

### Test Data Setup

#### Create Test Accounts

1. **Admin Account**
   - Username: `admin`
   - Password: `admin123`
   - Role: Administrator

2. **Participant Accounts**
   - Username: `participant1`, `participant2`, `participant3`
   - Password: `pass123`
   - Role: Participant

3. **Organizer Account**
   - Username: `organizer1`
   - Password: `org123`
   - Role: Organizer

#### Event Setup

1. Create test event in admin panel
2. Set geofence coordinates
3. Configure event dates and times
4. Add test participants

### Network Configuration

#### Test Networks
- **WiFi**: Stable, fast connection
- **Cellular**: 4G/5G, 3G (if available)
- **Offline**: Airplane mode
- **Poor Connection**: Throttled bandwidth

#### Network Testing Tools
- iOS: Network Link Conditioner
- Android: Developer Options > Network

---

## Authentication Testing

### Login Flow Testing

#### ✅ Test Case: Successful Login
```
Preconditions:
- Valid user account exists
- App is at login screen

Steps:
1. Enter valid username
2. Enter valid password
3. Tap "Login" button

Expected Results:
- Login succeeds
- Dashboard screen appears
- User greeting displays
- Session persists across app restarts
```

#### ❌ Test Case: Invalid Credentials
```
Steps:
1. Enter invalid username
2. Enter valid password
3. Tap "Login" button

Expected Results:
- Error message: "Invalid username or password"
- Login screen remains visible
- Input fields retain entered data
```

#### ❌ Test Case: Network Error During Login
```
Preconditions:
- Enable airplane mode

Steps:
1. Enter valid credentials
2. Tap "Login" button

Expected Results:
- Error message: "Network connection failed"
- Retry option available
- Login possible after network restored
```

### Password Change Testing

#### ✅ Test Case: Password Change Success
```
Preconditions:
- User logged in

Steps:
1. Navigate to Profile > Change Password
2. Enter current password
3. Enter new password (meets requirements)
4. Confirm new password
5. Tap "Change Password"

Expected Results:
- Success message displays
- User can login with new password
- Old password no longer works
```

#### ❌ Test Case: Password Requirements Validation
```
Steps:
1. Enter current password
2. Enter weak password (e.g., "123")
3. Confirm password
4. Tap "Change Password"

Expected Results:
- Error: "Password must be at least 8 characters"
- Password requirements list displays
- Form prevents submission
```

### Session Management Testing

#### ✅ Test Case: Session Persistence
```
Steps:
1. Login successfully
2. Close app completely
3. Reopen app

Expected Results:
- User remains logged in
- Dashboard loads directly
- No login prompt appears
```

#### ✅ Test Case: Logout Functionality
```
Steps:
1. Login successfully
2. Access menu/profile
3. Tap "Logout"
4. Confirm logout

Expected Results:
- User logged out
- Login screen appears
- Session data cleared
```

---

## Step Tracking Testing

### Basic Step Tracking

#### ✅ Test Case: Step Detection
```
Preconditions:
- Location permission granted
- Motion permission granted
- Inside event geofence

Steps:
1. Open app dashboard
2. Walk 100 steps
3. Observe step counter

Expected Results:
- Step count increases accurately
- Real-time updates visible
- Steps persist across app sessions
```

#### ✅ Test Case: Step Sync
```
Preconditions:
- Steps accumulated
- Network connection available

Steps:
1. Tap sync button
2. Wait for sync completion

Expected Results:
- Sync success message
- Steps uploaded to server
- Sync status indicator updates
```

### Permission Testing

#### ❌ Test Case: Motion Permission Denied
```
Preconditions:
- Motion permission denied in device settings

Steps:
1. Open app
2. Navigate to dashboard

Expected Results:
- Permission request appears
- Clear instructions for enabling permission
- Graceful degradation (manual entry option)
```

#### ❌ Test Case: Location Permission Denied
```
Preconditions:
- Location permission denied

Steps:
1. Enter event zone

Expected Results:
- Geofence detection fails
- Clear error message
- Manual location entry option
```

### Accuracy Testing

#### ✅ Test Case: Step Accuracy Validation
```
Steps:
1. Reset step counter
2. Walk exactly 50 steps (count manually)
3. Compare app count vs manual count

Expected Results:
- App count within 10% of manual count
- Consistent across multiple test runs
- No negative or impossible values
```

---

## Geofencing Testing

### Zone Detection

#### ✅ Test Case: Enter Event Zone
```
Preconditions:
- Location services enabled
- Outside event zone initially

Steps:
1. Physically move into event coordinates
2. Open app dashboard

Expected Results:
- "Inside Event Zone" status displays
- Step tracking activates automatically
- Zone entry logged/timestamped
```

#### ✅ Test Case: Exit Event Zone
```
Preconditions:
- Inside event zone

Steps:
1. Physically move outside event coordinates

Expected Results:
- "Outside Event Zone" status displays
- Step tracking pauses
- Automatic sync triggered
```

### Geofence Accuracy

#### ✅ Test Case: Zone Boundary Testing
```
Steps:
1. Position at exact geofence boundary
2. Move 1 meter inside boundary
3. Move 1 meter outside boundary
4. Observe status changes

Expected Results:
- Accurate boundary detection
- No flickering between states
- Consistent behavior across devices
```

### Location Services Testing

#### ❌ Test Case: Location Services Disabled
```
Preconditions:
- Location services turned off

Steps:
1. Open app

Expected Results:
- Clear prompt to enable location services
- App functions in limited mode
- Manual location entry available
```

---

## Admin Features Testing

### Funds Management

#### ✅ Test Case: Add Funds to Participant
```
Preconditions:
- Admin login
- Valid participant account

Steps:
1. Navigate to Admin > Funds Management
2. Select participant
3. Enter amount (€50.00)
4. Tap "Add Funds"

Expected Results:
- Success confirmation
- Participant balance updates
- Transaction logged
- Email notification sent (if configured)
```

#### ❌ Test Case: Invalid Fund Amount
```
Steps:
1. Select participant
2. Enter invalid amount (e.g., "-100")
3. Tap "Add Funds"

Expected Results:
- Validation error: "Amount must be positive"
- Form prevents submission
- Clear error messaging
```

### User Management

#### ✅ Test Case: View User Details
```
Preconditions:
- Admin login

Steps:
1. Navigate to Admin > User Management
2. Select a user
3. View user details

Expected Results:
- Complete user profile displays
- Step history visible
- Fund balance accurate
- Last activity timestamp
```

#### ✅ Test Case: Reset User Password
```
Steps:
1. Select user from list
2. Tap "Reset Password"
3. Confirm action

Expected Results:
- Temporary password generated
- User notified via email/app
- Admin can view new password
- User must change password on next login
```

---

## Offline Functionality Testing

### Offline Data Entry

#### ✅ Test Case: Offline Step Tracking
```
Preconditions:
- Enable airplane mode
- Inside event zone

Steps:
1. Accumulate steps while offline
2. Check offline queue

Expected Results:
- Steps stored locally
- Offline indicator visible
- Queue count accurate
- No sync attempts while offline
```

#### ✅ Test Case: Offline to Online Sync
```
Preconditions:
- Steps queued offline

Steps:
1. Disable airplane mode
2. Wait for automatic sync

Expected Results:
- All queued data syncs successfully
- Server confirms receipt
- Local queue clears
- Sync status updates
```

### Offline Error Handling

#### ❌ Test Case: Sync Conflict Resolution
```
Preconditions:
- Data modified offline and online

Steps:
1. Modify data offline
2. Modify same data online
3. Reconnect and sync

Expected Results:
- Conflict detected
- User prompted to choose resolution
- Data integrity maintained
- Clear conflict explanation
```

---

## UI/UX Testing

### Visual Design Testing

#### ✅ Test Case: Theme Consistency
```
Steps:
1. Navigate through all screens
2. Check color scheme consistency
3. Verify typography hierarchy
4. Test component spacing

Expected Results:
- Consistent design language
- No color clashes
- Readable text on all backgrounds
- Proper spacing and alignment
```

#### ✅ Test Case: Dark/Light Mode
```
Preconditions:
- Device supports dark mode

Steps:
1. Enable system dark mode
2. Restart app
3. Navigate through screens

Expected Results:
- App respects system theme
- All text readable
- Icons and graphics appropriate
- No visual glitches
```

### Responsiveness Testing

#### ✅ Test Case: Screen Rotation
```
Steps:
1. Open app in portrait
2. Rotate to landscape
3. Use all features
4. Rotate back to portrait

Expected Results:
- Layout adapts properly
- No content cut off
- Functionality preserved
- Smooth transitions
```

#### ✅ Test Case: Different Screen Sizes
```
Steps:
1. Test on small phone (e.g., iPhone SE)
2. Test on large phone (e.g., iPhone 14 Pro Max)
3. Test on tablet (if supported)

Expected Results:
- Content scales appropriately
- Touch targets accessible
- Text readable without zooming
- No horizontal scrolling required
```

### Accessibility Testing

#### ✅ Test Case: VoiceOver/TalkBack
```
Preconditions:
- Screen reader enabled

Steps:
1. Navigate app using voice commands
2. Interact with all controls

Expected Results:
- All elements have proper labels
- Logical navigation order
- Clear audio feedback
- No accessibility blockers
```

---

## Performance Testing

### App Launch Performance

#### ✅ Test Case: Cold Start Time
```
Steps:
1. Completely close app
2. Clear app from recent apps
3. Launch app from home screen
4. Measure time to usable state

Expected Results:
- App launches within 3 seconds
- Splash screen displays appropriately
- No long blank screens
```

### Memory Usage Testing

#### ✅ Test Case: Memory Leak Check
```
Steps:
1. Open app
2. Navigate through 10+ screens
3. Use features extensively
4. Monitor memory usage
5. Return to home screen

Expected Results:
- Memory usage stable
- No continuous increase
- App remains responsive
- No crashes due to memory pressure
```

### Battery Usage Testing

#### ✅ Test Case: Battery Impact
```
Preconditions:
- Start with 100% battery

Steps:
1. Use app for 30 minutes with GPS/step tracking
2. Monitor battery drain

Expected Results:
- Battery drain < 10% per hour during active use
- Background battery usage minimal
- Clear battery optimization options
```

---

## Security Testing

### Data Protection

#### ✅ Test Case: Secure Data Storage
```
Steps:
1. Login and use app
2. Check device storage for sensitive data
3. Attempt to access stored data

Expected Results:
- No plaintext passwords stored
- Sensitive data encrypted
- Proper keychain/keystore usage
- No data leakage in logs
```

#### ❌ Test Case: Session Timeout
```
Preconditions:
- App inactive for 30+ minutes

Steps:
1. Return to app

Expected Results:
- Automatic logout triggered
- Login required to continue
- Session data cleared
```

### Input Validation

#### ❌ Test Case: SQL Injection Prevention
```
Steps:
1. Enter malicious input in text fields
2. Attempt form submissions

Expected Results:
- Input properly sanitized
- No injection vulnerabilities
- Safe error handling
- No unexpected behavior
```

---

## Device Compatibility Testing

### iOS Version Testing

#### ✅ Test Case: iOS Compatibility Matrix
```
Test on:
- iOS 15.0+
- iPhone SE (small screen)
- iPhone 14 Pro (large screen)
- iPad (if supported)

Expected Results:
- Consistent behavior across versions
- Proper screen adaptation
- All features functional
```

### Android Version Testing

#### ✅ Test Case: Android Compatibility Matrix
```
Test on:
- Android 10+
- Small screen device
- Large screen device
- Different manufacturers (Samsung, Google, etc.)

Expected Results:
- Consistent behavior across versions
- Proper permission handling
- All features functional
```

### Cross-Platform Consistency

#### ✅ Test Case: Feature Parity
```
Steps:
1. Test same features on iOS and Android
2. Compare behavior and UI

Expected Results:
- Feature parity maintained
- UI consistent with platform conventions
- Performance similar across platforms
```

---

## Bug Report Templates

### Critical Bug Report Template

```
**Bug ID:** BUG-XXX
**Severity:** Critical/High/Medium/Low
**Priority:** P1/P2/P3

**Title:** [Brief description]

**Environment:**
- Device: [e.g., iPhone 14 Pro]
- OS: [e.g., iOS 16.5]
- App Version: [e.g., 1.1.0]
- Network: [WiFi/Cellular/Offline]

**Preconditions:**
- [List any required setup]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Results:**
- [What should happen]

**Actual Results:**
- [What actually happens]

**Screenshots/Videos:**
- [Attach media]

**Additional Notes:**
- [Any other relevant information]
```

### UI/UX Bug Report Template

```
**Bug ID:** UI-XXX
**Type:** Visual/Interaction/Responsiveness

**Description:**
[Detailed description of the issue]

**Affected Screens:**
- [List screens/pages]

**Device/Screen Details:**
- Device: [model]
- Screen size: [dimensions]
- Orientation: [portrait/landscape]

**Screenshots:**
- [Before/After comparisons]
- [Annotated screenshots showing issue]

**Expected Design:**
[Reference to design specs or expected appearance]
```

### Performance Issue Template

```
**Issue ID:** PERF-XXX
**Type:** Speed/Memory/Battery

**Description:**
[Detailed description of performance issue]

**Metrics:**
- Expected: [target performance]
- Actual: [measured performance]

**Test Conditions:**
- Device: [model]
- App state: [foreground/background]
- Network: [connection type]
- Duration: [test duration]

**Reproduction Steps:**
1. [Steps to reproduce performance issue]

**Profiling Data:**
[Attach performance logs, memory dumps, etc.]
```

---

## Regression Testing

### Release Regression Checklist

#### Pre-Release Testing
- [ ] All critical user journeys functional
- [ ] Authentication flows working
- [ ] Step tracking accuracy verified
- [ ] Geofencing working correctly
- [ ] Admin features operational
- [ ] Offline functionality tested
- [ ] UI consistent across devices
- [ ] Performance within acceptable limits
- [ ] Security measures in place
- [ ] No critical bugs remaining

#### Post-Release Monitoring
- [ ] Crash reports monitored
- [ ] User feedback reviewed
- [ ] Performance metrics tracked
- [ ] Update success rate monitored
- [ ] Backward compatibility verified

### Automated Regression Tests

```bash
# Quick regression test suite
npm run test:smoke    # 5-minute critical path tests
npm run test:ui       # UI component regression
npm run test:api      # API integration tests
npm run test:e2e      # End-to-end regression (if implemented)
```

---

## Test Execution Checklist

### Daily Testing Routine
- [ ] Smoke test all major features
- [ ] Check for new crashes
- [ ] Verify recent bug fixes
- [ ] Test on latest device/OS versions

### Weekly Testing Routine
- [ ] Complete feature testing cycle
- [ ] Performance benchmarking
- [ ] Compatibility testing
- [ ] Security vulnerability checks

### Release Testing Routine
- [ ] Full regression test suite
- [ ] Beta testing with real users
- [ ] Performance and stability testing
- [ ] Documentation review and update

---

## Tools and Resources

### Testing Tools
- **Bug Tracking**: Jira, GitHub Issues
- **Test Management**: TestRail, Zephyr
- **Device Testing**: BrowserStack, Firebase Test Lab
- **Performance**: Xcode Instruments, Android Profiler
- **Accessibility**: Accessibility Inspector, VoiceOver

### Documentation Resources
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Guidelines](https://material.io/design)
- [WCAG Accessibility Standards](https://www.w3.org/WAI/WCAG21/quickref/)

---

**© 2025 DKL Organization - Manual Testing Guide**
**Last Updated:** 26 Oktober 2025
**Version:** 1.1.0
**Status:** ✅ **COMPREHENSIVE MANUAL TEST SUITE**

**Happy Testing! 🧪📱**