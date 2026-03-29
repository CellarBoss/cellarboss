# Mobile App (`apps/mobile`)

## Tech Stack

| Category      | Technology                                              |
| ------------- | ------------------------------------------------------- |
| Framework     | Expo SDK 55 / React Native 0.83                         |
| Language      | TypeScript 5.9 (strict mode)                            |
| Navigation    | Expo Router v3 (file-based), React Navigation v7        |
| UI            | React Native Paper 5.15 (Material Design), Lucide icons |
| Data Fetching | TanStack React Query v5                                 |
| Forms         | TanStack React Form                                     |
| Validation    | Zod 4                                                   |
| Auth          | Better Auth (Bearer token via `expo-secure-store`)      |
| Gestures      | react-native-gesture-handler                            |
| Animations    | react-native-reanimated 4, react-native-worklets        |
| Charts/SVG    | react-native-svg                                        |
| Unit Testing  | Jest (jest-expo preset) + Testing Library               |
| E2E Testing   | Maestro                                                 |
| Builds        | EAS Build                                               |

## Scripts

| Script                  | Description                                |
| ----------------------- | ------------------------------------------ |
| `pnpm start`            | Start Expo dev server                      |
| `pnpm android`          | Build and run on Android (emulator/device) |
| `pnpm ios`              | Build and run on iOS (simulator/device)    |
| `pnpm web`              | Run in browser via Expo web                |
| `pnpm test`             | Run Jest unit tests                        |
| `pnpm test:watch`       | Run unit tests in watch mode               |
| `pnpm test:coverage`    | Run unit tests with coverage report        |
| `pnpm lint`             | Run ESLint via `expo lint`                 |
| `pnpm test:e2e`         | Run Maestro smoke tests (`e2e/smoke/`)     |
| `pnpm docs:dev`         | Start VitePress user docs dev server       |
| `pnpm docs:build`       | Build VitePress user docs                  |
| `pnpm docs:screenshots` | Generate screenshots for docs              |

## Project Structure

```
apps/mobile/
├── src/
│   ├── app/                   # Expo Router file-based pages
│   │   ├── _layout.tsx        # Root layout (providers + AuthGate)
│   │   ├── index.tsx          # Auth redirect entry point
│   │   ├── (auth)/            # Unauthenticated screens
│   │   │   ├── setup.tsx      # Server URL configuration
│   │   │   └── login.tsx      # Sign-in form
│   │   └── (app)/
│   │       └── (tabs)/        # Tab navigator + all authenticated screens
│   ├── components/            # Shared React Native components
│   ├── contexts/              # React contexts (auth, navigation-history)
│   ├── hooks/                 # Custom hooks (re-exports from @cellarboss/common)
│   ├── lib/
│   │   ├── api/               # API client (makeRequest, client.ts, base-url.ts)
│   │   ├── auth/              # Auth service (sign-in/out/session), secure-store
│   │   ├── constants/         # App constants (bottle status, wine types, etc.)
│   │   ├── fields/            # Form field definitions per domain
│   │   ├── functions/         # Utility functions (format, query-gate)
│   │   ├── types/             # Frontend-specific TypeScript types
│   │   ├── env.ts             # Reads API_BASE_URL from Expo config extras
│   │   └── theme.ts           # React Native Paper theme
│   ├── styles/                # Shared StyleSheet objects
│   └── __tests__/             # Unit tests (mirrors src structure)
├── e2e/
│   ├── flows/                 # Maestro full test flows per domain
│   ├── smoke/                 # Lightweight smoke tests
│   ├── shared/                # Shared setup-and-login flow
│   └── scripts/               # Seed/reset data scripts (Node.js)
├── assets/                    # Icons and splash screen images
├── plugins/                   # Custom Expo config plugins
├── app.config.ts              # Expo app configuration
├── eas.json                   # EAS Build profiles
└── babel.config.js
```

## Navigation

Expo Router uses file-system routing. Route groups:

| Group          | Description                                 |
| -------------- | ------------------------------------------- |
| `(auth)`       | `setup` and `login` screens (no tab bar)    |
| `(app)/(tabs)` | Authenticated app with bottom tab navigator |

### Tab bar (visible tabs)

| Tab       | Route             | Icon                     |
| --------- | ----------------- | ------------------------ |
| Dashboard | `(tabs)/index`    | `view-dashboard-outline` |
| Cellar    | `(tabs)/bottles`  | `bottle-wine-outline`    |
| Wines     | `(tabs)/wines`    | `glass-wine`             |
| Storages  | `(tabs)/storages` | `warehouse`              |
| More      | `(tabs)/more`     | `dots-horizontal`        |

### Hidden routes (accessible via the More screen)

`countries`, `grapes`, `locations`, `regions`, `tasting-notes`, `vintages`, `winemakers`, `profile`

Each domain route group follows the pattern: `index` (list), `new` (create), `[id]` (detail), `[id]/edit` (edit).

Tapping a tab resets that tab's navigation stack back to its root screen.

## Auth Flow

1. **Bootstrap** — `AuthProvider` checks `expo-secure-store` for a saved server URL.
2. **`needs-setup`** — No server URL stored → redirect to Setup screen. User enters their CellarBoss server URL; the app tests connectivity before saving it.
3. **`unauthenticated`** — Server URL present but no valid session → redirect to Login screen.
4. **`authenticated`** — Bearer token validated via `GET /api/auth/get-session`.

The auth token and server URL are both stored in `expo-secure-store`. Tokens are sent as `Authorization: Bearer <token>` on every API request.

Auth state is a discriminated union: `loading | needs-setup | unauthenticated | authenticated`.

## API Client

```
makeRequest<T>(path, method, body?) → ApiResult<T>
```

- Base URL resolved from secure-store, falling back to `mobileEnv.apiBaseUrl`
- Auth token attached as `Authorization: Bearer <token>`
- `api` client built via `createApiClient({ request: makeRequest })` from `@cellarboss/common`
- `useApiQuery` re-exported from `@cellarboss/common/hooks/use-api-query` — same pattern as web (unwraps `ApiResult<T>`, throws `ApiQueryError` on `ok: false`)

## Unit Testing

Unit tests use Jest with the `jest-expo` preset and live in `src/__tests__/`, mirroring the source structure.

```bash
pnpm test             # run once
pnpm test:coverage    # with coverage report
pnpm test:watch       # watch mode
```

**Configuration** (`package.json` `jest` key):

- Preset: `jest-expo`
- Path alias: `@` maps to `src/`
- Setup: `mock-haptics.ts` (silences Expo Haptics in tests)
- Matchers: `@testing-library/react-native/matchers` via `setupFilesAfterEnv`
- Coverage: excludes `src/app/**` and `src/__tests__/**`

**Test helpers** (`src/__tests__/helpers/`):

| File                  | Purpose                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| `test-utils.tsx`      | `renderWithProviders()` — wraps PaperProvider + QueryClientProvider + NavigationHistoryProvider |
| `mock-api.ts`         | `mockOk(data)` / `mockError(msg)` — build `ApiResult` values                                    |
| `mock-api-client.ts`  | Jest mock for `@/lib/api/client`                                                                |
| `mock-navigation.tsx` | Jest mock for `expo-router`                                                                     |
| `mock-haptics.ts`     | Silences `expo-haptics` (used in `setupFiles`)                                                  |
| `mock-safe-area.tsx`  | Mock for `react-native-safe-area-context`                                                       |
| `fixtures.ts`         | Shared test data fixtures                                                                       |

## E2E Testing (Maestro)

End-to-end tests use [Maestro](https://maestro.mobile.dev/) and run against a real or emulated device.

```bash
pnpm test:e2e          # run smoke tests
maestro test e2e/flows/ # run all full flows
```

**App ID:** `org.cellarboss.mobile`

### How it works

1. `e2e/scripts/seed-data.js` seeds the test server with data
2. `e2e/shared/setup-and-login.yaml` clears app state, connects to the test server (`http://10.0.2.2:5174` on Android emulator), and logs in as `admin@cellarboss.test`
3. Individual flow files run against the logged-in app state

### Test structure

| Directory                   | Contents                                           |
| --------------------------- | -------------------------------------------------- |
| `e2e/smoke/`                | Lightweight login, navigation, and bottle creation |
| `e2e/flows/auth/`           | Login and logout flows                             |
| `e2e/flows/bottles/`        | CRUD for cellar bottles                            |
| `e2e/flows/wines/`          | CRUD for wines                                     |
| `e2e/flows/tasting-notes/`  | Create tasting notes                               |
| `e2e/flows/reference-data/` | CRUD for countries, grapes, regions, etc.          |
| `e2e/flows/navigation/`     | Tab navigation and More screen                     |
| `e2e/flows/dashboard/`      | Dashboard view                                     |
