# Moto Discovery

A mobile prototype for finding available motorcycle taxi drivers in Kigali and calling them directly. One app covers three modes: **Passenger**, **Driver**, and a simulated **Admin** console.

Everything runs on the device. There is no backend and no real OTP; live location is shared only within this device's demo data. Every simulated behaviour is labelled in the UI.

---

## Quick start

Requirements: Node.js 20+ and the **Expo Go** app (SDK 58) on an Android or iOS phone, or an emulator.

```bash
npm install
npx expo start          # scan the QR code with Expo Go
npm run android         # or open an Android emulator
npm run web             # browser preview (uses the schematic map)
```

Other scripts:

```bash
npm test                # Jest + React Native Testing Library
npm run typecheck       # tsc --noEmit (strict)
```

If `npm install` reports version mismatches after an Expo update, run `npx expo install --fix`.

### Demo credentials

| What | Value |
|---|---|
| OTP code (any phone number) | `123456` |
| Admin access code | `ADMIN-2026` |
| Sample phone numbers | `+250 700 000 1xx` (fictional range) |

### Maps

On Android and iOS the app uses `react-native-maps`. **Expo Go needs no API key.** A standalone Android build needs a Google Maps key in `app.json → android.config.googleMaps.apiKey`.

The app switches to a built-in **schematic map** when any of these is true:
- it is running on web;
- "Use schematic map" is on in Account → Demo settings;
- the native map throws an error.

The schematic map draws drivers at their true distance and bearing from you, so the experience stays usable without a map provider.

### Testing outside Rwanda

Sample drivers are placed around central Kigali. If you're elsewhere, turn on **Use Kigali demo location**. The app offers this on the location screen, in empty states, and in Settings.

---

## Demo walkthrough (acceptance criteria)

1. **Onboarding:** Landing page → Get started → slides → name and phone → OTP `123456` → choose **Both** → profile and motorcycle → **verify identity** (national ID, driving permit, live front-camera selfie) → location screen.
2. **Passenger:** The Nearby tab shows available drivers on the map and in the list. Search by name, area or plate. Change the radius. Switch between Available and All.
3. **Driver profile:** Tap a driver. **Call** opens the phone dialler and the driver appears under **Recent**. **Report this driver** files a report that shows up in admin mode.
4. **Driver mode:** Account → Mode → Driver. Your registration starts as *pending*. Tap **Simulate approval** (or approve yourself in admin mode), then toggle **You're online**.
5. **Shared settings:** Edit profile, Privacy & location, Safety, Sign out.
6. **States:** Deny location to see the permission-denied state. Turn on *Simulate load errors* to see the error state. Search for nonsense to see empty states. Airplane mode shows the offline banner.
7. **Admin:** Sign out → **Admin demo access** → `ADMIN-2026`. Dashboard cards open filtered lists. Approve, reject or suspend drivers (reasons are required). Suspend passengers. Move reports through open → under review → resolved or dismissed, and add notes. Settings → Reset demo data restores the samples.

---

## Architecture

```
app/                       Expo Router routes (screens only, no business logic)
  _layout.tsx              Providers + role-aware Stack.Protected groups
  index.tsx                Single redirect point: resolveHomeRoute(session)
  (auth)/                  welcome, onboarding, sign-in, register, verify-otp, admin-sign-in
  (setup)/                 role-select, profile-setup, location-permission
  (passenger)/             tabs: home, recent, account
  (driver)/                tabs: driver-dashboard, driver-activity, driver-account
  (admin)/                 tabs: admin-dashboard, -drivers, -passengers, -reports, -settings
  admin/{driver,passenger,report}/[id].tsx    admin detail screens
  driver/[id].tsx, report/[driverId].tsx, edit-profile, privacy, safety
src/
  components/ui/           Design system: Button, TextField, Card, StatusBadge, Avatar, ChipGroup,
                           SegmentedControl, ConfirmDialog, Toast, Empty/Error/Loading states, ...
  components/drivers/      DriverCard, DriverMap (+ .native / web split), FallbackMap
  components/admin/        AdminScreen, AdminBanner, list rows, navigation helpers
  components/forms/        react-hook-form + zod bindings, shared ProfileForm
  data/mock/               All sample data (drivers, passengers, contacts, reports, activity)
  features/discovery/      filterNearbyDrivers: pure passenger-discovery rules
  features/admin/          selectors: dashboard stats, list filters, attention items
  state/                   SessionProvider, SettingsProvider, AppDataProvider + reducer, SelfRecordSync
  services/                storage, secureStorage, location, phone, simulatedAuth, simulatedNetwork
  hooks/                   useUserLocation, useNearbyDrivers, useCallDriver, useSelfDriver, ...
  lib/                     geo, format, labels, validation schemas
  theme/                   colors, spacing, typography
__tests__/                 unit and component tests
```

### How state flows

- **`AppDataProvider`** holds one shared store of drivers, passengers, contacts, reports and the activity log. It is driven by a **pure reducer** (`src/state/appData/reducer.ts`).
  - Ids and timestamps arrive inside each action, so the reducer is deterministic and easy to test.
  - Every change records an activity event.
- **Every screen reads from the same store**, so admin changes propagate instantly:
  - Suspending a driver takes them offline, hides them from passenger search and updates the dashboard counters, with no refresh.
  - A driver going online appears in passenger discovery immediately.
- **Dashboard numbers come only from selectors** (`features/admin/selectors.ts`), never from stored totals, so counters and lists can't disagree.
- **`SessionProvider`** owns the simulated auth flow, the profile and the active role.
- **`SelfRecordSync`** keeps the device user's own driver and passenger records in the shared store in step with their profile. It also recreates them after a demo-data reset.
- **`useNearbyDrivers`** puts the first load (and pull-to-refresh) through `simulateRequest`. This makes loading and error states visible; after that, results re-derive from state.

### Persistence

| Data | Where | Why |
|---|---|---|
| Session token, profile (name, phone) | `expo-secure-store` (Keychain / Keystore) | Personal data |
| Demo records, settings, onboarding flags, active role | AsyncStorage | Not sensitive; easy to reset |

On **web**, SecureStore isn't available, so the preview falls back to AsyncStorage (localStorage). The web build is for demos only.

### Connecting a backend later

Screens only depend on hooks and `services/*`. To go live:
- Replace `simulatedAuth.ts` with real OTP endpoints.
- Make `AppDataProvider`'s actions call the API, either optimistically or by refetching.
- Swap `useNearbyDrivers`' simulated request for a geo query.
- Delete the `SelfRecordSync` and `createSampleContactsForDriver` stand-ins.

The reducer, selectors and UI can stay as they are.

---

## Simulation vs. production (security note)

This is a **front-end simulation**:

- **Admin mode** is unlocked by a code compiled into the app. Role-based navigation (`Stack.Protected`) stops casual navigation and deep links in the wrong mode, but it is **not security**: anyone with the app bundle can read the code. In production:
  - admin sign-in must be done by a server;
  - every privileged action (approve, reject, suspend, report status) must be authorised, validated and logged by a trusted backend;
  - the client should only display what the server allows.
- **OTP** is fixed at `123456`; no SMS is sent.
- **Availability** changes only on this device and is not published anywhere.
- **Driver verification** collects photos of the national ID and driving permit plus a live selfie (front camera only, no gallery). They are stored on the device and shown side by side to the admin, who compares the faces manually. There is no automatic face matching or document check; approval is a local status change.
- **Calls** open the device dialler with the number filled in. The app records a contact when the dialler opens, not when a call actually happens.
- **Location:** the driver dashboard follows the device's GPS while it is open (foreground only) and, when online, updates the driver's position in the local store, which the passenger driver profile shows on a live map. With the Kigali demo location on, the dashboard plays a simulated ride. Sample drivers' positions are fixed.

## Known limitations

- Only one device user exists at a time. Signing in with a different number creates a new local profile.
- There is no real-time sync: other phones never see your changes.
- On web, the dialler depends on the browser and OS. Native maps are replaced by the schematic map.
- Mock dates are generated relative to when demo data was first created. Use **Reset demo data** to refresh them.
- The UI is English only. Typography uses the system font.

## Testing

```bash
npm test
```

The suite contains 46 tests:

- **Reducer:** verification, suspension, availability rules, report lifecycle and notes.
- **Selectors:** dashboard totals add up, date ranges, and counters updating after admin actions.
- **Discovery rules:** unverified or suspended drivers are never shown, radius, sorting, and search.
- **Validation:** Rwandan phone numbers, OTP, plate numbers, and reasons.
- **Geo and format helpers.**
- **Components:** Button, badges, EmptyState, ConfirmDialog reason validation, and DriverCard call action.

The full journeys were also checked manually on the web build: onboarding, discovery, driver profile, driver online, admin approve/reject/suspend, report review, and role-guard redirects.

## Screenshots

See `docs/screenshots/` for the welcome screen, passenger map and list, driver profile, driver online state, admin dashboard, and report review.
