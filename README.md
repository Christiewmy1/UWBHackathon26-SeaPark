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
│   ├── .env                        # SDOT_APP_TOKEN (data.seattle.gov app token)
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

`backend/.env`:
```
SDOT_APP_TOKEN=your_data_seattle_gov_app_token
```

Get a free token at [data.seattle.gov](https://data.seattle.gov) → Sign In → Developer Settings → Create App Token.
