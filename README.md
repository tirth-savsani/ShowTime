# 🎬 ShowTime — Full-Stack Movie Ticket Booking Platform

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Test_Mode-0C2340?logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Tests](https://img.shields.io/badge/Tests-13%20Passed%20%7C%2079%20Passed-brightgreen)](https://jestjs.io/)

**ShowTime** is a production-grade, full-stack movie ticket booking platform engineered on the **MERN** stack (MongoDB, Express, React 19, Node.js). Designed to replicate the seamless user experience of **BookMyShow**, it is backed by an enterprise-grade Model-View-Controller (MVC) architecture with an isolated Service Layer, atomic multi-seat concurrency locking, Razorpay test payment integration, automated background schedulers, 24-hour self-service booking cancellations with instant refunds, and persistent 30-day authentication.

---

## 📑 Table of Contents

- [Architectural Highlights](#-architectural-highlights)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Concurrency-Safe Seat Reservation Engine](#-concurrency-safe-seat-reservation-engine)
- [Payment Flow & Automated Reconciliation](#-payment-flow--automated-reconciliation)
- [24-Hour Cancellation & Instant Seat Release](#-24-hour-cancellation--instant-seat-release)
- [Persistent Authentication & Session Hydration](#-persistent-authentication--session-hydration)
- [Database Models & Schemas](#-database-models--schemas)
- [Background Cron Schedulers](#-background-cron-schedulers)
- [Project Directory Structure](#-project-directory-structure)
- [Environment Configuration](#-environment-configuration)
- [Installation & Local Setup](#-installation--local-setup)
- [Seeding Catalog & Shows](#-seeding-catalog--shows)
- [Automated Testing Suite](#-automated-testing-suite)
- [API Reference](#-api-reference)
- [Demo Credentials](#-demo-credentials)
- [License](#-license)

---

## 🌟 Architectural Highlights

- **Strict MVC + Service Layer**: Routing definitions contain zero database queries. Controllers handle request normalization, validation, and serialization. The service layer manages transactions, business rules, concurrency locks, and third-party integrations.
- **Zero Double-Booking Guarantee**: Employs compound unique indexes `{ show: 1, seatId: 1 }` in MongoDB alongside atomic rollback logic and multi-document ACID transactions.
- **Deterministic Response Serialization**: Serializer views sanitize internal MongoDB representations (`_id`, `__v`, `passwordHash`) and expose consistent JSON envelopes (`{ success, message, data }`).
- **Resilient Background Jobs**: Built-in `node-cron` schedulers continuously clean up orphaned holds, reconcile captured Razorpay transactions, and ensure rolling 7-day showtimes across screens.
- **Instant Client Hydration**: Redux state hydrates instantly from a cached localStorage session snapshot to eliminate login flicker, paired with `httpOnly` secure JWT cookies.

---

## 🚀 Key Features

### User Experience
- **Multi-City Discovery**: Seamlessly browse movies across 10 major Indian cities (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Chandigarh, Kochi).
- **Rich Movie Exploration**: Filter catalog by genres, languages (Hindi, English, Tamil, Telugu, etc.), formats (2D, 3D, IMAX 2D, 4DX), and release status (*Now Showing* vs *Coming Soon*).
- **Comprehensive Movie Details**: High-resolution backdrops, trailers, duration, censor certificate, synopsis, and cast lists.
- **Showtime Browser**: Filter showtimes by date (next 7 days), audio language, and format with live occupancy indicators (`AVAILABLE`, `FILLING_FAST`, `SOLD_OUT`).
- **Interactive SVG Seat Layout**: Dynamically renders multi-tier seat maps (SILVER, GOLD, PLATINUM) with aisles, seat numbering, curved cinema screen graphics, and real-time seat availability states (`AVAILABLE`, `HELD`, `BOOKED`, `MINE`).
- **1 to 6 Seat Multi-Select**: Built-in seat count selector modal with automatic price calculation and category segregation.
- **Secure Razorpay Test Checkout**: In-browser payment gateway simulation verifying cryptographic HMAC SHA-256 signatures server-side.
- **Printable Digital Ticket**: Booking confirmation view with dynamic QR code generation, theatre directions, screen number, show timing, and browser print stylesheet.
- **Self-Service Cancellation**: 1-click booking cancellation with a 100% refund guarantee, enforced up to 24 hours prior to showtime.
- **My Bookings Dashboard**: Tabbed booking history (*Upcoming*, *Past*, *Cancelled*) displaying ticket references, seat details, payment IDs, and refund statuses.

---

## 🏛 System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               React 19 Frontend (Vite)                 │
                    │   Redux Toolkit  •  Tailwind CSS  •  React Router v7   │
                    └───────────────────────────┬────────────────────────────┘
                                                │ HTTPS / JSON / Cookies
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ShowTime Express API Server                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Middleware Pipeline:                                                                           │
│  [ Helmet  •  CORS (withCredentials)  •  Rate Limiter  •  Cookie Parser  •  Authenticate ]       │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Routes Layer           (/api/auth, /api/movies, /api/theatres, /api/shows, /api/bookings)      │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Validators Layer       (Zod Schemas: common, auth, movie, theatre, show, booking)              │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Controllers Layer      (Thin request parsing, calls Service Layer, wraps with Response Views)  │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Service Layer          (Core Business Rules, Concurrency Locks, Multi-Doc ACID Transactions)   │
│                         • auth.service        • booking.service    • seat.service               │
│                         • show.service        • theatre.service    • payment.service            │
│                         • ticket.service      • showScheduler.service                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Views / Serializers    (Sanitization: user.view, movie.view, show.view, booking.view)          │
└───────────────┬───────────────────────────────┬─────────────────────────────────┬───────────────┘
                │                               │                                 │
                ▼                               ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────────┐ ┌─────────────────────────────────┐
│    MongoDB Replica Set        │ │   Razorpay Payments API   │ │   Background Cron Jobs          │
│ • User       • Movie          │ │ • Order Creation          │ │ • expirePendingJob (every 1m)   │
│ • Theatre    • Screen         │ │ • HMAC SHA256 Signature   │ │ • reconcilePaymentsJob (every 1m│
│ • Show       • SeatHold (TTL) │ │ • Payment Auto-Capture    │ │ • rollingShowsJob (daily 00:00) │
│ • BookedSeat • Booking        │ │ • Automated Refunds       │ └─────────────────────────────────┘
└───────────────────────────────┘ └───────────────────────────┘
```

---

## 🔒 Concurrency-Safe Seat Reservation Engine

A primary engineering challenge in high-demand ticket booking is avoiding race conditions and double-bookings when multiple users attempt to reserve the exact same seats simultaneously.

ShowTime enforces a multi-tiered safety mechanism:

```
                            ┌─────────────────────────────────┐
                            │ User requests 1 to 6 Seat Holds │
                            └────────────────┬────────────────┘
                                             │
                       ┌─────────────────────▼─────────────────────┐
                       │ 1. Validate show in future & seats exist  │
                       │    in screen layout template              │
                       └─────────────────────┬─────────────────────┘
                                             │
                       ┌─────────────────────▼─────────────────────┐
                       │ 2. Query active holds & booked seats      │
                       │    to verify availability                 │
                       └─────────────────────┬─────────────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             │ Atomically insert SeatHold records with compound unique index │
             │                 Index: { show: 1, seatId: 1 }                 │
             └───────────────────────────────┬───────────────────────────────┘
                                             │
                             ┌───────────────┴───────────────┐
                          Success                         Collision (E11000)
                             │                               │
              ┌──────────────▼─────────────┐  ┌──────────────▼──────────────────────┐
              │ 201 Created                │  │ Rollback: Delete user's partial     │
              │ • 5-minute temporary hold  │  │ holds created in this request       │
              │ • Live status = 'MINE'     │  │ Throw 409 Conflict with list of     │
              └──────────────┬─────────────┘  │ conflicting seat IDs                │
                             │                └─────────────────────────────────────┘
                             ▼
              ┌────────────────────────────┐
              │ Checkout Initiated?        │
              │ Extends hold by +3 minutes │
              │ (Hard-capped at 8 min max) │
              └──────────────┬─────────────┘
                             ▼
              ┌────────────────────────────┐
              │ Payment Confirmed?         │
              │ ACID Transaction:          │
              │ 1. Insert BookedSeat rows  │
              │ 2. Delete SeatHold records │
              │ 3. Save Confirmed Booking  │
              └────────────────────────────┘
```

### Key Guarantees
1. **Compound Unique Database Constraint**: Both `SeatHold` and `BookedSeat` enforce `{ show: 1, seatId: 1 }` as unique indexes. The database engine guarantees that no two records for the same show and seat can coexist.
2. **All-or-Nothing Atomicity**: When holding multiple seats, if even a single seat collides with a concurrent user, any holds inserted during that request are instantly rolled back, and an HTTP `409 CONFLICT` is returned listing the contested seats.
3. **Automatic Expiry Sweep**: `SeatHold` uses a native MongoDB TTL index on `expiresAt` (5 minutes). Furthermore, `jobs/expirePending.job.js` sweeps every 60 seconds to release orphaned holds and mark expired checkout sessions.
4. **Hold Extension on Checkout**: Initiating checkout extends the hold window by 3 minutes (capped at 8 minutes from creation) so the user has sufficient time to complete payment verification.

---

## 💳 Payment Flow & Automated Reconciliation

ShowTime integrates **Razorpay** in test mode with strict server-side cryptographic verification:

```
[Client]             [ShowTime Backend]             [Razorpay]              [MongoDB]
   │                         │                          │                       │
   │─── 1. POST /checkout ──▶│                          │                       │
   │                         │─── 2. Create Order ─────▶│                       │
   │                         │◀── 3. order_id returned ─│                       │
   │◀── 4. Checkout Data ────│                          │                       │
   │    (orderId, amount)    │                          │                       │
   │                         │                          │                       │
   │─── 5. Razorpay Modal ─────────────────────────────▶│                       │
   │◀── 6. payment_id + signature ──────────────────────│                       │
   │                         │                          │                       │
   │─── 7. POST /verify ────▶│                          │                       │
   │    (orderId, paymentId, │─── 8. Verify HMAC-SHA256 │                       │
   │     signature)          │    using timingSafeEqual │                       │
   │                         │─── 9. Capture Payment ──▶│                       │
   │                         │                          │─── 10. ACID Txn ─────▶│
   │                         │                          │    • Insert BookedSeat│
   │                         │                          │    • Delete SeatHold  │
   │                         │                          │    • Confirm Booking  │
   │◀── 11. Confirmed Ticket │                          │◀── 12. Committed ─────│
```

- **Constant-Time Verification**: Payment signatures are validated using `crypto.timingSafeEqual` to eliminate timing attack vectors.
- **Double-Hold Race Recovery**: In the event that seats were somehow taken before confirmation completes (duplicate key `11000` on `BookedSeat`), the backend immediately triggers an automatic refund via Razorpay, marks the booking as `FAILED`, and notifies the user.
- **Background Payment Reconciliation**: `jobs/reconcilePayments.job.js` runs every minute to query pending bookings against Razorpay, capturing any authorized payments that were abandoned by the client browser.

---

## 🔄 24-Hour Cancellation & Instant Seat Release

ShowTime provides a flexible self-service cancellation workflow with an uncompromising seat-availability contract:

1. **24-Hour Cutoff Validation**:
   ```javascript
   const showTime = new Date(booking.snapshot.startTime).getTime();
   const cutoffMs = CANCEL_CUTOFF_HOURS * 60 * 60 * 1000; // 24 hours
   if (showTime - Date.now() <= cutoffMs) {
     throw new AppError('Cancellation window closed (only permitted > 24h before showtime)', 409);
   }
   ```
2. **Instant Seat Release**:
   Inside a MongoDB ACID session:
   - Deletes all `BookedSeat` records associated with the booking.
   - Clears any lingering `SeatHold` records.
   - Updates booking status to `CANCELLED` and marks `cancelledAt`.
   - **Result**: The cancelled seats immediately transition to `AVAILABLE` on the visual seat map for any other customer without polling delays or cache invalidation lag.
3. **Automated 100% Refund**:
   Calls Razorpay's refund API for the full ticket amount and records the `refund.id` and status (`PROCESSED` or `FAILED`) on the booking.

---

## 🛡 Persistent Authentication & Session Hydration

To ensure users remain logged in across page reloads and browser restarts:

- **30-Day JWT Cookie**: The auth token is stored in an `httpOnly`, `sameSite: 'lax'` cookie with a 30-day lifetime (`JWT_EXPIRES_IN = '30d'`). JavaScript cannot read the token, mitigating XSS risks.
- **Instant Redux State Boot**: The user profile snapshot is cached in `localStorage` (`showtime_user_session`). When the React application boots, Redux initializes directly from this cache:
  ```javascript
  const savedSession = loadSession();
  const initialState = {
    user: savedSession,
    status: savedSession ? 'authenticated' : 'idle',
  };
  ```
  This eliminates visual flickering (e.g. login buttons flashing before switching to user avatars).
- **Background Validation**: In parallel, the app dispatches `fetchMe()` to `GET /api/auth/me`. If the session is invalid or revoked, the local cache is pruned and the user is cleanly signed out.

---

## 🗄 Database Models & Schemas

| Model | Collection | Primary Responsibility & Key Indexes |
| :--- | :--- | :--- |
| **`User`** | `users` | Customer profiles, credentials (`bcrypt` hashed), role (`user`), `isActive` status. Index: `{ email: 1 }` (unique). |
| **`Movie`** | `movies` | Movie titles, slugs, SVG/Cloudinary poster & backdrop URLs, genres, languages, formats, durations, censor certificates, cast, status (`now_showing`, `coming_soon`, `archived`). Text index on `{ title, synopsis }`. |
| **`Theatre`** | `theatres` | Multiplex names, cities, street addresses, location coordinates, status. Index: `{ city: 1, status: 1 }`. |
| **`Screen`** | `screens` | Screen names, projection formats (`2D`, `3D`, `IMAX 2D`, `4DX`), seating layouts (tier categories, row codes, seat numbering, aisle offsets). Index: `{ theatre: 1 }`. |
| **`Show`** | `shows` | Scheduled screenings mapping a Movie + Screen + Theatre to a start/end time, audio language, format, and tier pricing. Compound index: `{ screen: 1, startTime: 1 }`. |
| **`SeatHold`** | `seatholds` | Transient 5-minute seat locks. **Unique Compound Index**: `{ show: 1, seatId: 1 }`. TTL index: `{ expiresAt: 1 }`. |
| **`BookedSeat`** | `bookedseats` | Permanent seat ownership for confirmed bookings. **Unique Compound Index**: `{ show: 1, seatId: 1 }`. Index: `{ booking: 1 }`. |
| **`Booking`** | `bookings` | Customer bookings with unique reference code (`SHT-XXXXXX`), seat array, total amount, Razorpay order/payment/signature metadata, refund tracking, and denormalized movie/theatre snapshot. Indexes: `{ bookingRef: 1 }` (unique), `{ user: 1, createdAt: -1 }`. |

---

## ⏰ Background Cron Schedulers

ShowTime registers three automated background jobs powered by `node-cron`:

```
┌─────────────────────────┬───────────────────┬────────────────────────────────────────────────────────┐
│ Job Name                │ Frequency         │ Purpose & Execution Logic                              │
├─────────────────────────┼───────────────────┼────────────────────────────────────────────────────────┤
│ expirePendingJob        │ Every 1 minute    │ • Sweeps and deletes expired `SeatHold` records.       │
│                         │ (*/1 * * * *)     │ • Marks checkout bookings older than 10 mins as        │
│                         │                   │   `EXPIRED` and frees their associated seats.          │
├─────────────────────────┼───────────────────┼────────────────────────────────────────────────────────┤
│ reconcilePaymentsJob    │ Every 1 minute    │ • Scans pending bookings created in the last 15 mins.  │
│                         │ (*/1 * * * *)     │ • Inspects Razorpay API for captured payments.         │
│                         │                   │ • Auto-confirms abandoned or dropped client sessions.  │
├─────────────────────────┼───────────────────┼────────────────────────────────────────────────────────┤
│ rollingShowsJob         │ Daily at 00:00 IST│ • Scans all screens and generates rolling scheduled    │
│                         │ (0 0 * * *)       │   shows for the upcoming 7-day window.                 │
│                         │                   │ • Prevents schedule gaps and auto-assigns showtimes.   │
└─────────────────────────┴───────────────────┴────────────────────────────────────────────────────────┘
```

---

## 📂 Project Directory Structure

```
ShowTime/
├── backend/                              # Express REST API (MVC + Service Layer)
│   ├── config/
│   │   ├── constants.js                  # Global backend constants (times, limits, enums)
│   │   ├── db.js                         # Mongoose MongoDB connection manager
│   │   ├── env.js                        # Environment variable schema validation
│   │   └── razorpay.js                   # Razorpay SDK initialization
│   ├── controllers/                      # Request extraction & response dispatchers
│   │   ├── auth.controller.js
│   │   ├── booking.controller.js
│   │   ├── movie.controller.js
│   │   ├── payment.controller.js
│   │   ├── show.controller.js
│   │   └── theatre.controller.js
│   ├── jobs/                             # Background cron tasks
│   │   ├── expirePending.job.js
│   │   ├── reconcilePayments.job.js
│   │   └── rollingShows.job.js
│   ├── middlewares/                      # Express middleware stack
│   │   ├── authenticate.js               # JWT verification & req.user attachment
│   │   ├── errorHandler.js               # Centralized API error handler & normalizer
│   │   ├── notFound.js                   # 404 Route catch-all
│   │   ├── rateLimiter.js                # Rate-limiting policies (auth, bookings)
│   │   └── validate.js                   # Zod schema validation middleware
│   ├── models/                           # Mongoose Schemas & Indexes
│   │   ├── BookedSeat.js
│   │   ├── Booking.js
│   │   ├── Movie.js
│   │   ├── Screen.js
│   │   ├── SeatHold.js
│   │   ├── Show.js
│   │   ├── Theatre.js
│   │   └── User.js
│   ├── routes/                           # API Route Definitions
│   │   ├── auth.routes.js
│   │   ├── booking.routes.js
│   │   ├── movie.routes.js
│   │   ├── payment.routes.js
│   │   ├── show.routes.js
│   │   └── theatre.routes.js
│   ├── seed/                             # Database Seeder & Mock Data
│   │   ├── data/                         # 50 movies & 29 theatres across 10 cities
│   │   └── seedAll.js                    # Idempotent database seeder
│   ├── services/                         # Core Domain & Business Logic Layer
│   │   ├── auth.service.js
│   │   ├── booking.service.js
│   │   ├── movie.service.js
│   │   ├── payment.service.js
│   │   ├── seat.service.js
│   │   ├── show.service.js
│   │   ├── showScheduler.service.js
│   │   ├── theatre.service.js
│   │   └── ticket.service.js
│   ├── tests/                            # Jest & Supertest Integration Suites
│   │   ├── auth.test.js
│   │   ├── booking.test.js
│   │   ├── hold.concurrency.test.js
│   │   └── ... (13 suites total)
│   ├── utils/                            # Helpers (cookie, QR generator, catchAsync)
│   ├── views/                            # Serializer views & standard JSON envelopes
│   ├── server.js                         # HTTP server bootstrapper
│   └── app.js                            # Express application setup & middleware mounting
│
├── frontend/vite-project/                # React 19 Client (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/                          # Axios API clients
│   │   │   ├── axios.js                  # Base Axios instance with auth interceptor
│   │   │   ├── auth.api.js
│   │   │   ├── bookings.api.js
│   │   │   ├── movies.api.js
│   │   │   ├── shows.api.js
│   │   │   └── theatres.api.js
│   │   ├── components/                   # UI Component Library
│   │   │   ├── common/                   # Reusable UI (Button, Modal, Badge, Skeleton)
│   │   │   ├── layout/                   # Header, Footer, Navigation, Modals
│   │   │   ├── movie/                    # MoviePosterCard, MovieCarousel, FilterSidebar
│   │   │   ├── seat/                     # ScreenGraphic, SeatItem, SeatCountModal
│   │   │   └── shows/                    # DateSelector, ShowCard, FilterBar
│   │   ├── pages/                        # Application Route Views
│   │   │   ├── Home.jsx                  # Hero banners, Now Showing, Coming Soon
│   │   │   ├── Explore.jsx               # Movie catalog search & multi-filter
│   │   │   ├── MovieDetail.jsx           # Movie synopsis, trailer, cast, formats
│   │   │   ├── Shows.jsx                 # Theatre schedules & date selector
│   │   │   ├── SeatSelection.jsx         # Interactive seat map & tier pricing
│   │   │   ├── Checkout.jsx              # Order summary & Razorpay payment
│   │   │   ├── Confirmation.jsx          # Digital ticket & dynamic QR code
│   │   │   ├── MyBookings.jsx            # Booking history & 24h cancellation
│   │   │   ├── Login.jsx                 # User sign in
│   │   │   └── Register.jsx              # User registration
│   │   ├── store/                        # Redux Toolkit Store
│   │   │   ├── slices/authSlice.js       # Persistent auth state & session cache
│   │   │   ├── slices/bookingSlice.js    # Active seat holds & selection
│   │   │   └── slices/citySlice.js       # Selected city state & storage
│   │   └── utils/                        # Formatters, toast notifications, Razorpay loader
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── docs/                                 # Specifications & References
    ├── BACKEND_SPEC.md
    ├── FRONTEND_SPEC.md
    └── CONFIG_REFERENCE.md
```

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | Node environment (`development`, `test`, `production`) | `development` |
| `PORT` | Yes | HTTP port for the Express API | `8084` |
| `CLIENT_URL` | Yes | Frontend origin for CORS and cookie allowlist | `http://localhost:5173` |
| `dbURL` | Yes | MongoDB URI (**Must support Replica Sets** for ACID transactions) | `mongodb://localhost:27017/showtime?replicaSet=rs0` |
| `JWT_SECRET` | Yes | Secret key used to sign authentication JWTs (min 32 chars) | `your_super_secret_jwt_key_at_least_32_chars` |
| `JWT_EXPIRES_IN` | No | JWT cookie validity duration | `30d` |
| `RAZORPAY_KEY_ID` | Yes | Razorpay test mode Key ID | `rzp_test_yourkey` |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay test mode Key Secret | `your_razorpay_secret` |
| `RAZORPAY_WEBHOOK_SECRET` | No | Secret for verifying Razorpay webhook signatures | `your_webhook_secret` |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name for image uploads | `showtime_cloud` |
| `CLOUDINARY_API_KEY` | No | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API Secret | `your_cloudinary_secret` |
| `SEED_CONFIRM` | No | Set to `true` to wipe and re-seed all collections | `false` |

### Frontend (`frontend/vite-project/.env`)

| Variable | Required | Description | Default |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | No | Base URL of the backend API | `http://localhost:8084` |
| `VITE_RAZORPAY_KEY_ID` | No | Razorpay test mode key for in-browser checkout | `rzp_test_yourkey` |

---

## 💻 Installation & Local Setup

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (Local replica set or MongoDB Atlas cluster)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/ShowTime.git
cd ShowTime

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend/vite-project
npm install
```

### 2. Configure Environment Files

Create `backend/.env` using the reference table above.

---

## 🌾 Seeding Catalog & Shows

ShowTime comes equipped with an idempotent database seeder that populates:
- **1 Demo Customer User** (`demo@showtime.test` / `Demo@1234`)
- **50 Curated Movies** (38 *Now Showing*, 12 *Coming Soon*) complete with SVG posters
- **29 Multiplex Theatres** across 10 major Indian cities
- **59 Screens** featuring custom layouts:
  - *Layout A* (220 seats across Platinum, Gold, Silver)
  - *Layout B* (140 seats)
  - *Layout C* (80 seats)
- **Rolling Shows** scheduled across screens for the next 7 days at `10:00`, `13:30`, `17:00`, and `20:30` IST.

```bash
cd backend

# Safe seed (skips if data exists)
npm run seed

# Clean wipe & fresh re-seed
# On Windows PowerShell:
$env:SEED_CONFIRM="true"; npm run seed

# On Linux / macOS:
SEED_CONFIRM=true npm run seed
```

---

## 🏃 Running the Application

### Start the Backend Server
```bash
cd backend
npm run dev
# Or for standard execution:
npm start
```
* Backend API: `http://localhost:8084`
* Health Check: `http://localhost:8084/health`

### Start the Frontend Application
```bash
cd frontend/vite-project
npm run dev
```
* Frontend Application: `http://localhost:5173`

---

## 🧪 Automated Testing Suite

The backend contains **13 comprehensive Jest integration test suites** (79 automated tests) verifying all mission-critical booking paths, race conditions, and error invariants using `mongodb-memory-server`:

```bash
cd backend

# Run all test suites
npm test

# Run in CI mode
npm run test:ci
```

### Test Coverage Highlights
- **Seat Concurrency & Race Conditions** (`hold.concurrency.test.js`): Spawns parallel asynchronous requests attempting to hold identical seats; proves zero double-booking and validates atomic rollback.
- **Booking Lifecycle** (`booking.test.js`): Validates checkout creation, Razorpay signature verification, ticket building, seat release, and 24-hour cancellation rules.
- **Hold Expiry & Sweeper** (`expirePending.test.js`): Verifies hold timeout enforcement and automatic seat recovery.
- **Razorpay Hardening** (`razorpayHardening.test.js`): Simulates payment verification failures, order ID mismatches, and auto-refund triggers.
- **Response Envelopes** (`responseRegression.test.js`): Asserts that all API responses strictly conform to standard JSON envelope specs.

---

## 📡 API Reference

All responses return standardized envelopes:
- **Success**: `{ success: true, message: string, data: ... }`
- **Paginated List**: `{ success: true, message: string, data: { items: [...], pagination: { page, limit, total, pages } } }`
- **Error**: `{ success: false, message: string, code: string, errors?: [...], details?: {...} }`

### 1. Authentication (`/api/auth`)
| Verb | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | None | Register a new user account |
| `POST` | `/api/auth/login` | None | Authenticate user & issue 30-day `token` cookie |
| `POST` | `/api/auth/logout` | None | Clear `token` cookie |
| `GET` | `/api/auth/me` | User | Retrieve authenticated user profile |

### 2. Movies & Catalog (`/api/movies`)
| Verb | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/movies` | None | List movies with filters (city, genre, format, language, search, status) |
| `GET` | `/api/movies/:id` | None | Fetch detailed movie metadata & cast |
| `GET` | `/api/movies/sections` | None | Fetch grouped sections (*Now Showing*, *Coming Soon*) for home page |

### 3. Theatres & Cities (`/api/theatres`)
| Verb | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/theatres/cities` | None | List distinct active cities |
| `GET` | `/api/theatres` | None | List active theatres (filtered by city) |
| `GET` | `/api/theatres/:id` | None | Get specific theatre details |

### 4. Shows & Seat Map (`/api/shows`)
| Verb | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/shows` | None | Query scheduled shows (by movie, theatre, date) |
| `GET` | `/api/shows/:id` | None | Get single show metadata |
| `GET` | `/api/shows/:id/seats` | None | Real-time visual seat map (`AVAILABLE`, `HELD`, `BOOKED`, `MINE`) |
| `POST` | `/api/shows/:id/hold` | User | Atomically hold 1–6 seats for 5 minutes |
| `DELETE`| `/api/shows/:id/hold` | User | Release active seat holds for current user |

### 5. Bookings & Payments (`/api/bookings`)
| Verb | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/bookings/checkout` | User | Create pending booking & Razorpay order |
| `POST` | `/api/bookings/verify` | User | Verify HMAC signature, confirm booking & release holds |
| `POST` | `/api/bookings/:id/failed` | User | Mark checkout as dismissed/failed |
| `GET` | `/api/bookings/my` | User | List user's bookings (tabs: `upcoming`, `past`, `cancelled`) |
| `GET` | `/api/bookings/:id` | User | Retrieve digital ticket details with QR code |
| `POST` | `/api/bookings/:id/cancel`| User | Cancel booking & issue 100% refund (> 24h before show) |

---

## 👤 Demo Credentials

For testing and local evaluation, use the pre-seeded account:

- **Email**: `demo@showtime.test`
- **Password**: `Demo@1234`
- **Role**: `user`

---

## 📄 License

This project is licensed under the **ISC License**. Built with ❤️ for educational and demonstration purposes.
