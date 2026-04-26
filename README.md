# SeaPark — UWB Hackathon 2026

Crowdsourced parking app for Seattle. Uses SDOT open data to show time-of-day occupancy estimates, free-parking-day detection, and community reports to sharpen predictions.

---

## Running the project

You need **3 terminals** in VS Code:

**Terminal 1 — Backend**
```powershell
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Expo app (iOS + Android via Expo Go)**
```powershell
cd mobile
npx expo start
```

**Terminal 3 — Web client (browser demo)**
```powershell
cd mobile\client
npm run dev
```

Then scan the QR code from Terminal 2 with the **Expo Go** app on your phone.
Web client opens at `http://localhost:8080`.

### Connecting phones to the backend

Physical devices need the backend exposed via VS Code port forwarding:
1. VS Code → **Ports** panel → **Forward a Port** → `8000`
2. Right-click the row → **Port Visibility → Public**
3. Copy the URL (e.g. `https://xxxx-8000.usw2.devtunnels.ms`) into:
   - `mobile/src/constants/index.ts` — `_detectBackendUrl()` return value
   - `mobile/client/src/services/parkingApi.ts` — `API_BASE` fallback

---

## Project structure

```
SeaPark/
├── backend/                        # FastAPI Python backend
│   ├── main.py                     # API server — parking lots, AI query, reports
│   ├── requirements.txt            # Python dependencies
│   ├── .env.local                  # SDOT_APP_TOKEN — never committed (copy from .env.example)
│   ├── .env.example                # Template showing required variables
│   ├── firebase/
│   │   └── firebaseAdmin.py        # Firebase Admin SDK setup
│   └── services/
│       ├── data_loader.py          # Data loading utilities
│       ├── ml.py                   # ML / prediction helpers
│       └── scoring.py              # Lot scoring logic
│
├── mobile/                         # React Native app (Expo)
│   ├── App.tsx                     # Root component — screen router
│   ├── index.ts                    # Expo entry point
│   ├── src/
│   │   ├── constants/
│   │   │   └── index.ts            # Colors, spacing, API URL, map config
│   │   ├── screens/
│   │   │   ├── MapScreen.tsx       # Map view with color-coded parking markers
│   │   │   ├── SpotDetailsScreen.tsx  # Lot details, availability bar, crowdsource buttons
│   │   │   └── AIConciergeScreen.tsx  # Husky AI chat interface
│   │   ├── hooks/
│   │   │   └── useAvailability.js  # Fetches lots from backend, falls back to static data
│   │   ├── data/
│   │   │   ├── sdotService.js      # SDOT open data API client
│   │   │   ├── mockParkingLots.js  # Fallback lot list (used if backend is offline)
│   │   │   ├── parkingLotSchema.js # Data shape normalization
│   │   │   ├── availabilityEngine.js  # Occupancy estimate calculations
│   │   │   └── holidayLogic.js     # Free-parking day detection (Sundays + 8 holidays)
│   │   ├── services/
│   │   │   ├── api.ts              # Axios API client
│   │   │   └── firebase.ts         # Firebase client setup
│   │   └── types/
│   │       └── index.ts            # Shared TypeScript types
│   └── package.json
│
└── mobile/client/                  # React web client (browser demo)
    ├── src/
    │   ├── App.tsx                 # Router — map / husky / report / 404
    │   ├── screens/
    │   │   ├── Index.tsx           # Main map screen — fetches live lots from backend
    │   │   ├── Husky.tsx           # Husky AI concierge screen
    │   │   ├── Report.tsx          # Submit a parking report
    │   │   └── NotFound.tsx        # 404 page
    │   ├── components/
    │   │   ├── MapCanvas.tsx       # SVG map with spot pins
    │   │   ├── PhoneFrame.tsx      # Phone-frame wrapper for demo
    │   │   ├── BottomNav.tsx       # Bottom navigation bar
    │   │   ├── SpotDetailsSheet.tsx   # Slide-up sheet for lot details
    │   │   ├── SavedSheet.tsx      # Saved / bookmarked spots sheet
    │   │   ├── NavLink.tsx         # Nav link helper
    │   │   └── ui/                 # shadcn/ui component library
    │   ├── services/
    │   │   ├── mockData.ts         # Fallback spots (used if backend offline)
    │   │   └── parkingApi.ts       # Fetches lots from backend, maps to web format
    │   ├── stores/
    │   │   ├── savedStore.ts       # Saved spots state (localStorage)
    │   │   └── recentSearches.ts   # Recent search history state
    │   └── hooks/
    │       └── use-mobile.tsx      # Responsive breakpoint hook
    └── package.json
```

---

## How the data works

1. **On startup** the backend fires off an async request to the Seattle SDOT open data API (`data.seattle.gov`, dataset `7jzm-ucez`) to fetch 2019 hourly occupancy survey data.
2. It builds a lookup table: `neighborhood → hour → average occupancy %`.
3. When `/api/v1/parking/lots` is called, each lot's `estimatedAvailable` is calculated using the current hour's historical rate for that neighborhood.
4. Lots with SDOT data show `"Live SDOT estimate"` as the freshness label; others show `"Estimated"`.
5. **Community reports** (Found a Spot / It's Full buttons) shift the estimate up or down and increase confidence.
6. Metered parking is automatically marked free on Sundays and 8 Seattle holidays.

---

## Key API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/parking/lots` | All lots with current occupancy estimates |
| GET | `/api/v1/parking/lots/{id}` | Single lot |
| GET | `/api/v1/parking/search?query=` | Search by name or address |
| POST | `/api/v1/reports` | Submit a crowdsource report |
| POST | `/api/v1/ai/query` | Husky AI parking question |
| GET | `/api/v1/seattle/holidays` | Free parking day check |
| GET | `/api/v1/health` | Server health + SDOT areas loaded |
| GET | `/docs` | Interactive API explorer |

---

## Environment variables

Secrets live in `.env.local` files (never committed). Copy the `.env.example` in each folder and fill in your values.

| File | Variable | What it's for |
|------|----------|---------------|
| `backend/.env.local` | `SDOT_APP_TOKEN` | data.seattle.gov API token |
| `mobile/.env.local` | `EXPO_PUBLIC_API_URL` | Backend URL for Expo app |
| `mobile/client/.env.local` | `VITE_API_URL` | Backend URL for web client |

Get a free SDOT token at [data.seattle.gov](https://data.seattle.gov) → Sign In → Developer Settings → Create App Token.

---

## Technologies used

### Python
The backend is written in Python. `backend/main.py` is the entire server. Python was chosen because it's fast to write, has great libraries for data processing, and works well for a hackathon where you need to go from idea to working API quickly.

### FastAPI
FastAPI is the Python web framework that turns functions into HTTP endpoints. When the Expo app calls `/api/v1/parking/lots`, FastAPI runs the `get_parking_lots()` function and sends back JSON. It also auto-generates an interactive API explorer at `http://localhost:8000/docs` where you can test every endpoint in the browser.

### JavaScript / TypeScript
All the frontend code is written in TypeScript — a version of JavaScript that adds types so you catch bugs before running the code. The React Native app (`mobile/`) and the web client (`mobile/client/`) are both TypeScript. The data files in `mobile/src/data/` are plain JavaScript (`.js`) since they were written before types were set up.

### React Native + Expo
React Native lets you write one codebase that runs as a native app on both iOS and Android. Expo is a layer on top that handles building, running, and deploying without needing Xcode or Android Studio. **Expo Go** is the phone app that scans the QR code and runs your code instantly during development — no install needed on the device.

### React (Web client)
The web client (`mobile/client/`) is a standard React app built with Vite. It runs in any browser and shows the same parking map as the phone app. It was built with shadcn/ui components and Tailwind CSS for styling.

### JSON
JSON is the data format used everywhere in this project. The backend returns JSON from every endpoint. The Expo app and web client both parse that JSON to display parking data. Example of what `/api/v1/parking/lots` returns for one lot:
```json
{
  "lotId": "pacific-place",
  "name": "Pacific Place Parking Garage",
  "lat": 47.6113,
  "lng": -122.3358,
  "totalStalls": 1100,
  "estimatedAvailable": 462,
  "confidence": 0.80,
  "pricePerHour": 3.5,
  "meterFreeToday": false,
  "freshnessLabel": "Live SDOT estimate"
}
```

### REST APIs
The backend exposes a REST API — a set of URLs that return data when you call them. The apps use `fetch()` to call these URLs and get JSON back. Every screen in the app is powered by one or more of these API calls.

### Firebase
Firebase is Google's cloud platform used for storing user data. In this project it handles:
- **Firestore** — a cloud database for saving parking reports and user favorites
- **Authentication** — anonymous sign-in so users can save spots without creating an account

Firebase is set up but runs in "disabled" mode if no API key is provided — the app still works fully using the Python backend alone.

### VS Code Dev Tunnels
Because the backend runs on your laptop, physical phones on the network can't reach `localhost:8000` directly. VS Code Dev Tunnels creates a public HTTPS URL (e.g. `https://xxxx-8000.usw2.devtunnels.ms`) that forwards traffic to your local backend. This is set in `mobile/.env.local` and `mobile/client/.env.local`.

---

## How SDOT data is used

**SDOT** (Seattle Department of Transportation) publishes open datasets on [data.seattle.gov](https://data.seattle.gov). SeaPark uses dataset `7jzm-ucez` — the **Paid Parking Occupancy Study** — which contains field survey counts taken across Seattle neighborhoods in 2017–2019.

Each row in the dataset looks like:
```
study_area: "Capitol Hill"
date_time:  "4/23/2019 14:00"
parking_spaces: 35
total_vehicle_count: 22
```

### What the backend does with it

1. **On startup**, the backend fetches ~8,000 rows from the SDOT API (in the background, so the server responds immediately).
2. It groups the rows by `study_area` and hour of day, then averages the occupancy percentage across all survey dates:
   ```
   Capitol Hill → { 8: 0.30, 9: 0.45, 14: 0.63, 18: 0.71, 20: 0.55, ... }
   ```
3. When a client calls `/api/v1/parking/lots`, the backend looks up the **current hour** in that table for each lot's neighborhood and uses it to calculate `estimatedAvailable`:
   ```
   estimatedAvailable = totalStalls × (1 − occupancy_rate_for_this_hour)
   ```
4. Lots whose neighborhood matched an SDOT study area get `freshnessLabel: "Live SDOT estimate"` and a higher confidence score (0.80 vs 0.65). Lots with no SDOT match fall back to a static estimate.

### Why this matters

Without SDOT data, every lot would show the same static number regardless of time of day. With it, Capitol Hill shows high occupancy at 7 PM on a Friday (as the surveys show), and SoDo shows low occupancy on a weekday morning. The numbers change each time the app fetches because they're calculated against the real current hour.

### The app token

The `SDOT_APP_TOKEN` in `backend/.env.local` is a free API key from data.seattle.gov. Without it, requests still work but are rate-limited to ~1,000/day. With it, the limit is much higher. The token is never sent to the frontend — only the Python backend uses it.
