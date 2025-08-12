# Telemetry & Monitoring Options for React Native Apps

## Overview

Telemetry enables real-time monitoring, diagnostics, and data-driven improvements for mobile apps. For the `auction-market-app`, adding telemetry will help track performance, errors, usage patterns, and user behavior.

---

## Recommended Solution: Sentry for Expo React Native

### Why Sentry?

Sentry provides real-time error/crash reporting, performance monitoring, session replay, alerting (email, Teams, Slack), and GitHub integration for automated issue creation. It is well-supported in Expo managed and bare workflows.

---

## Sentry Features (React Native SDK)

-   **Automatic Native Crash Error Tracking** (sentry-cocoa & sentry-android)
-   **Automatic detection of ANR (Android) & App Hangs (iOS)**
-   **Offline storage of events** (reports sent when device reconnects)
-   **Events enriched with device data**
-   **Source Context** (code snippets around stack frames)
-   **Autolinking**
-   **Breadcrumbs** for outgoing HTTP requests (XHR, Fetch), UI/system events, console logs
-   **Release Health** (tracks crash-free users and sessions)
-   **Tracing** (automatic transactions for app start, navigation, XHR/Fetch, user interactions)
-   **Slow/Frozen frames tracking**
-   **Stall Tracking** of the JS loop
-   **React Profiler** (tracks React components)
-   **On-device symbolication for JS (Debug)**
-   **RAM bundle & Hermes support**
-   **Expo support out of the box**
-   **Attachments** (store additional files with events)
-   **User Feedback** (collect user info when an event occurs)
-   **View Hierarchy** (shows native component structure at error time)

---

## Sentry Setup Guide

### 1. Create a Sentry Account & Project

-   Go to [sentry.io](https://sentry.io/) and create an account.
-   Create a new project for your app.

### 2. Install Sentry SDK

Run the Sentry wizard in your project root:

```sh
npx @sentry/wizard@latest -i reactNative
```

-   The wizard will patch your project and add necessary files/config.

### 3. Configure Sentry

Initialize Sentry as early as possible (e.g., in `App.js` or `app/_layout.tsx`):

```js
import * as Sentry from "@sentry/react-native";

Sentry.init({
	dsn: "YOUR_SENTRY_DSN_HERE",
	sendDefaultPii: true, // Optional: adds more context to events
});
```

### 4. Verify Integration

Add a test error to verify Sentry is working:

```js
throw new Error("My first Sentry error!");
```

-   Run your app and check Sentry dashboard for the error.

### 5. Optional Features

-   Enable tracing for performance monitoring.
-   Enable profiling for real user performance data.

### 6. Expo-Specific Notes

-   For managed Expo projects, follow the [Expo Sentry guide](https://docs.expo.dev/guides/using-sentry/).
-   Sentry works for both managed and bare Expo workflows.

---

## Sentry Features Summary

-   Error & crash reporting
-   Performance monitoring
-   Session replay
-   Alerts (email, Teams, Slack)
-   GitHub issue integration
-   Dashboard & filtering
-   User/session tracking

---

## Pricing & Complexity

| Feature             | Sentry (2025)             |
| ------------------- | ------------------------- |
| Free Tier           | Yes (up to 5k events/mo)  |
| Paid Tier (Starter) | ~$29/mo (100k events/mo)  |
| Enterprise          | Custom pricing            |
| Overage             | Yes, per event            |
| Notes               | Pricing per event, errors |

| Solution | Complexity | Notes                                                                    |
| -------- | ---------- | ------------------------------------------------------------------------ |
| Sentry   | Low-Medium | Expo config plugin, simple setup, advanced features may require ejecting |

---

## Next Steps

1. Integrate Sentry using Expo config plugins.
2. Define key metrics/events to track.
3. Review dashboards and set up alerts for critical issues.

---

## References

-   [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
-   [Expo Sentry Integration](https://docs.expo.dev/guides/using-sentry/)
