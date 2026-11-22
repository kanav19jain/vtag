# VTag

**VTag** is an MVP web app that links a vehicle to its owner through a unique QR code. A scanner sees only permitted vehicle details and can start a **simulated** call — no real phone number is ever exposed, and no real call is ever placed.

> ⚠️ This is a demo build. OTPs are displayed on screen and telephony is a mock. No paid SMS or calling service is integrated.

---

## Features

- **Development OTP auth** — mobile number + 6-digit code, no SMS provider. The code is generated with `crypto.randomInt`, bcrypt-hashed in memory, expiry/attempt/resend limits enforced, and returned in the API response only in development.
- **JWT sessions** — protected owner API and client route guards.
- **Vehicle management** — add, list and delete vehicles (registration number, model, type).
- **Unique QR tags** — cryptographically random `vt_…` identifiers, QR PNG generated server-side with `qrcode`, downloadable via a protected endpoint.
- **Public contact page** (`/t/:tagId`) — mobile-first, no login, vehicle details only.
- **Mock telephony provider** — initiations, ringing, connection, ending and failure states, all clearly labelled as a demo. A "force failure" demo control exercises the failure path.
- **Activity history** — scans and simulated call records in MongoDB, shown on the dashboard. Visitor IPs are HMAC-hashed; raw IPs are never stored.
- **Provider abstraction** — `server/src/services/telephony/` keeps telephony swappable for a real provider later.

---

## Tech stack

| Layer | Technologies |
| --- | --- |
| Client | React 18, Vite 6, React Router 7, Axios, Tailwind CSS 3, lucide-react |
| Server | Node.js, Express 4, MongoDB, Mongoose 8 |
| Auth | JWT (`jsonwebtoken`), bcrypt |
| Validation / security | express-validator, express-rate-limit, helmet, cors |
| QR | `qrcode` |

---

## Project structure

```
vtag/
├── client/                     # React + Vite frontend
│   └── src/
│       ├── api/client.js       # axios instance, typed API groups, token handling
│       ├── components/         # layout, cards, modal, QR panel, guards
│       ├── context/            # AuthContext
│       └── pages/              # landing, login, dashboard, public tag, 404
├── server/                     # Express API
│   └── src/
│       ├── config/             # env + MongoDB connection
│       ├── controllers/        # request handlers
│       ├── middleware/         # auth, validation, rate limits, errors
│       ├── models/             # Owner, Vehicle, ScanEvent, CallRecord
│       ├── routes/             # modular route definitions
│       ├── services/           # OTP, QR, telephony provider abstraction
│       └── utils/              # OTP/tag helpers, AppError
└── package.json                # convenience scripts to run both apps
```

---

## Setup

### Prerequisites

- Node.js 18+ (Node 20/22 recommended)
- A reachable MongoDB instance — local `mongod` or MongoDB Atlas
  - The app still boots without MongoDB for health checks, but data endpoints require it.

### 1. Install dependencies

```bash
# from the repository root
npm run install:all
```

Or install each app separately:

```bash
npm --prefix server install
npm --prefix client install
```

### 2. Configure environment variables

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

On macOS/Linux use `cp` instead of `copy`.

`server/.env` — important values:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/vtag` | MongoDB connection string |
| `JWT_SECRET` | dev placeholder | **Set a long random string** (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` | JWT lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin(s) and base URL embedded in QR codes |
| `DEV_OTP_ENABLED` | `true` | Show OTP in API responses. Forced off when `NODE_ENV=production` |
| `OTP_TTL_MINUTES` / `OTP_RESEND_SECONDS` / `OTP_MAX_ATTEMPTS` | `5` / `60` / `5` | OTP policy |
| `TELEPHONY_PROVIDER` | `mock` | Only `mock` is implemented in the MVP |
| `MOCK_CALL_FAILURE_RATE` | `0.15` | Chance of a simulated call failing |

`client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

> Changing `CLIENT_URL` after creating tags means old QR codes point to the old origin. Set it correctly before generating tags.

### 3. Run locally

```bash
npm run dev          # starts API (:5000) and client (:5173) together
```

Or run them separately:

```bash
npm --prefix server run dev
npm --prefix client run dev
```

Open <http://localhost:5173>. Health check: <http://localhost:5000/api/health>.

---

## Try the flow

1. Click **Create account** → enter any 10–15 digit mobile number (e.g. `9876543210`).
2. The generated 6-digit code appears in an amber **Development OTP** panel. Click **Use code** → **Verify & continue**.
3. In the dashboard, click **Add vehicle**, fill in registration, model and type.
4. Open **View QR** to see the tag, copy its link, or **Download PNG**. Stick/print it on the vehicle.
5. Open the public link (or `/t/<tagId>`) in another browser/incognito window: only vehicle details are shown.
6. Click **Call owner — demo**. The UI walks through *starting → connecting → connected*, with a live timer and **End demo call**. Expand **Demo controls** and tick **Force a failed call** to see the failure state.
7. Return to the dashboard: scans and demo calls appear under **Recent activity**.

---

## API overview

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Service + DB status |
| POST | `/api/auth/request-otp` | – | Generate dev OTP |
| POST | `/api/auth/verify-otp` | – | Verify OTP, upsert owner, return JWT |
| GET | `/api/auth/me` | Bearer | Current owner |
| GET | `/api/owner/vehicles` | Bearer | List vehicles |
| POST | `/api/owner/vehicles` | Bearer | Create vehicle + tag + QR |
| GET | `/api/owner/vehicles/:id` | Bearer | Vehicle detail |
| GET | `/api/owner/vehicles/:id/qr` | Bearer | Download QR PNG |
| DELETE | `/api/owner/vehicles/:id` | Bearer | Delete vehicle + its history |
| GET | `/api/owner/history` | Bearer | Scan/call history + totals |
| GET | `/api/public/tags/:tagId` | – | Public vehicle details, logs a scan |
| POST | `/api/public/tags/:tagId/calls` | – | Start a demo call |
| GET | `/api/public/calls/:publicId` | – | Poll demo call status |
| PATCH | `/api/public/calls/:publicId/end` | – | End a demo call |

**Public endpoints never include an owner phone number.** Call lookups use a UUID `publicId`, not the internal Mongo `_id`.

---

## Privacy & demo notes

- No owner phone number appears in any public response, and the mock provider never receives a real dialable number.
- Public tag URLs use `crypto.randomBytes`, so tags cannot be enumerated sequentially.
- Scans are de-duplicated per (vehicle, hashed visitor) within 10 minutes, then counted. The user agent and referrer are stored for basic history.
- OTPs live only in server memory and are deleted after successful verification or expiry — restarting the API clears pending codes.
- All call states are simulated in-process; restarting the API clears the mock provider's active calls.
- Demo calls are rate-limited (40/hour per IP) and OTP endpoints to 30/15 min per IP.

---

## Tests

```bash
npm test                         # server unit + HTTP smoke tests (no DB required)
npm --prefix server test         # same
npm --prefix client run build    # production build of the frontend
```

Server tests cover OTP/tag utilities, the mock telephony state machine, health/validation/auth middleware wiring and JSON error handling.

---

## Production notes (out of scope for this MVP)

- Set `NODE_ENV=production` and a strong `JWT_SECRET`; development OTPs are automatically disabled, so a real SMS provider must be added.
- Replace the in-memory OTP store with a store backed by Redis/MongoDB.
- Implement `TelephonyProvider` in `server/src/services/telephony/` for a real provider and register it in `index.js` — controllers and UI do not need changes.
- Use TLS, tighten CORS/Helmet CSP, and add persistent rate limiting for multi-instance deployments.
