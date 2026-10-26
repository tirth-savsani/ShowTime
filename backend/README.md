# ShowTime Backend API

ShowTime is a backend-heavy BookMyShow-style movie ticket booking REST API built with Node.js, Express, MongoDB (Mongoose), and Razorpay test mode. It implements a strict Model-View-Controller (MVC) architecture with an isolated Service Layer to guarantee transaction safety, high-concurrency seat locking, and strict separation of concerns.

---

## Architecture & Design Principles

```
  ┌───────────────┐
  │  HTTP Client  │
  └───────┬───────┘
          │ (JSON / Cookies)
  ┌───────▼─────────────────────────────────────────────────┐
  │ Middleware Pipeline                                     │
  │ [Helmet, CORS, RateLimiter, CookieParser, Authenticate] │
  └───────┬─────────────────────────────────────────────────┘
          │
  ┌───────▼───────────────┐
  │ Routes (Routing only) │
  └───────┬───────────────┘
          │
  ┌───────▼──────────────────────────┐
  │ Controllers (Thin Request/Res)   │
  └───────┬──────────────────────────┘
          │
  ┌───────▼────────────────────────────────────────────────┐
  │ Service Layer (Core Business Rules & Transactions)     │
  │ [seat.service, booking.service, report.service, etc.]  │
  └───────┬──────────────────────┬─────────────────────────┘
          │                      │
  ┌───────▼────────┐     ┌───────▼────────┐
  │ Mongoose Models│     │ External SDKs  │
  │ (Data Schemas) │     │ [Razorpay,     │
  └────────────────┘     │  Cloudinary]   │
                         └────────────────┘
```

1. **Routes**: Define URL endpoints, HTTP verbs, and wire up validation / authorization middlewares. Contain zero database queries and zero business logic.
2. **Controllers**: Thin request handlers. Extract parameters, call services, and return responses wrapped in standardized envelope helpers via `views/response.js`.
3. **Service Layer**: Houses all domain business rules, cross-collection MongoDB replica set transactions, concurrency coordination, pricing calculations, and external SDK integrations.
4. **Views**: Dedicated serializer views (`user.view.js`, `report.view.js`, `response.js`) ensuring internal fields (`__v`, `passwordHash`, raw secrets) never leak to clients.

---

## Seat-Hold Concurrency Engine

The seat hold engine guarantees zero double-booking under extreme parallel booking conditions through a multi-tiered safety mechanism:

```
                  ┌───────────────────────────────┐
                  │ Parallel Hold Request (1-6)   │
                  └──────────────┬────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │ 1. Validate show in future,         │
              │    seats exist in screen layout     │
              └──────────────────┬──────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │ 2. Check no conflicting active hold │
              │    or booked seat exists            │
              └──────────────────┬──────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │ Insert SeatHold records with compound unique  │
         │ index: { show: 1, seatId: 1 }                 │
         └───────────────────────┬───────────────────────┘
                                 │
                     ┌───────────┴───────────┐
                  Success                 Duplicate Key (11000)
                     │                       │
      ┌──────────────▼─────────────┐ ┌───────▼──────────────────────┐
      │ Return 201 Created         │ │ Rollback user's partial holds│
      │ ExpiresAt = now + 5 minutes│ │ Throw 409 Conflict with list │
      └────────────────────────────┘ │ of unavailable seats         │
                                     └──────────────────────────────┘
```

* **Compound Unique Index**: Both `SeatHold` and `BookedSeat` enforce `{ show: 1, seatId: 1 }` unique compound indexes at the database level.
* **All-or-Nothing Guarantee**: When holding multiple seats (1 to 6), if even a single seat collides with a concurrent user, any holds inserted during that request for that user are immediately deleted in rollback, and a `409 Conflict` is returned listing the contested seats.
* **Automatic TTL Expiry**: `SeatHold.expiresAt` is indexed with MongoDB's native TTL mechanism. In addition, an asynchronous background cron job (`jobs/expirePending.job.js`) sweeps every minute to release orphaned holds and mark expired checkout sessions.
* **Idempotent Checkout Extension**: Initiating checkout on an active hold extends the hold window by 3 minutes (up to a hard cap of 8 minutes from creation) to allow the user to complete Razorpay payment verification without hold expiry.

---

## Environment Variables

Copy `.env.example` to `.env` in the `backend/` directory:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development`, `test`, `production`) | `development` |
| `PORT` | API listener port | `8084` |
| `CLIENT_URL` | Frontend origin for CORS and cookie allowlist | `http://localhost:5173` |
| `dbURL` | MongoDB connection URI (must support replica sets for transactions) | `mongodb://localhost:27017/showtime?replicaSet=rs0` |
| `JWT_SECRET` | Secret key for signing authentication JWT cookies (min 32 chars) | `your_super_secret_jwt_key_at_least_32_chars` |
| `JWT_EXPIRES_IN` | JWT validity duration | `7d` |
| `ADMIN_EMAIL` | Default administrator email for seeding | `admin@showtime.test` |
| `ADMIN_PASSWORD` | Default administrator password for seeding (min 8 chars) | `Admin@1234` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name for poster and backdrop storage | `showtime_cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret | `your_cloudinary_secret` |
| `RAZORPAY_KEY_ID` | Razorpay test mode Key ID | `rzp_test_yourkey` |
| `RAZORPAY_KEY_SECRET` | Razorpay test mode Key Secret | `your_razorpay_secret` |
| `RAZORPAY_WEBHOOK_SECRET`| Webhook signature verification secret | `your_webhook_secret` |
| `SEED_CONFIRM` | Confirmation flag required to wipe and re-seed collections | `true` (optional) |

---

## Setup & Running

### 1. Install Dependencies
```powershell
cd d:\ShowTime\backend
npm install
```

### 2. Seed Database
The seeding script populates users, 10 movies, 4 theatres across 3 cities, 8 screens with full layouts, and scheduled shows for the next 7 days:
```powershell
# Safe seed (skips if data exists)
npm run seed

# Force clean wipe & re-seed
$env:SEED_CONFIRM="true"; npm run seed
```

### 3. Start Development Server
```powershell
npm run dev
```
The server listens on `http://localhost:8084`. The health check is available at `http://localhost:8084/health`.

### 4. Run Test Suites
```powershell
# Standard test run with open handles detection
npm test

# CI mode (run in-band, force exit on finish)
npm run test:ci
```

---

## Demo Credentials

For testing and grading verification, the following credentials are pre-seeded:

* **Administrator**:
  * **Email**: `admin@showtime.test` (or configured `ADMIN_EMAIL`)
  * **Password**: `Admin@1234` (or configured `ADMIN_PASSWORD`)
  * **Permissions**: Access to `/api/admin/*` (movies, theatres, screens, shows, bookings, users, stats).
* **Demo Customer User**:
  * **Email**: `demo@showtime.test`
  * **Password**: `Demo@1234`
  * **Permissions**: Standard user booking, payments, and ticket history.

---

## Seed Data Summary (Spec B9)

* **Cities & Theatres**:
  * **Bengaluru**: Orion Cinemas, Galaxy Multiplex
  * **Mumbai**: Regal Screens
  * **Delhi NCR**: Star Cinema
* **Screens per Theatre**:
  * **Audi 1 (Layout A: 164 seats)**:
    * Rows A–C: PLATINUM (10 seats/row, aisle after seat 5)
    * Rows D–H: GOLD (14 seats/row, aisles after seats 4, 10)
    * Rows J–M: SILVER (16 seats/row, aisles after seats 4, 12; row I skipped)
  * **Audi 2 (Layout B: 76 seats)**:
    * Rows A–B: PLATINUM (8 seats/row, aisle after seat 4)
    * Rows C–G: GOLD (12 seats/row, aisle after seat 6; row I skipped)
* **Shows**:
  * 4 showtimes per day across screens: `10:00`, `13:30`, `17:00`, and `20:30` IST.
  * Standard Pricing: SILVER: ₹150, GOLD: ₹250, PLATINUM: ₹350 (+₹100 for IMAX shows).

---

## API Endpoints Overview

All responses use standardized JSON envelopes:
* Success: `{ success: true, message: string, data: ... }`
* Paginated List: `{ success: true, message: string, data: { items: [...], pagination: { page, limit, total, pages } } }`
* Error: `{ success: false, message: string, code: string, errors?: [...], details?: {...} }`

### Public Endpoints
| Verb | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server uptime and health probe |
| `POST`| `/api/auth/register` | Register new user account |
| `POST`| `/api/auth/login` | Authenticate and issue httpOnly JWT cookie |
| `POST`| `/api/auth/logout` | Clear authentication cookie |
| `GET` | `/api/movies` | List now showing / coming soon movies (filters: city, genre, format, language, search) |
| `GET` | `/api/movies/:id` | Get single movie details and metadata |
| `GET` | `/api/cities` | List distinct active cities |
| `GET` | `/api/theatres` | List active theatres (filtered by city) |
| `GET` | `/api/theatres/:id`| Get single theatre metadata |
| `GET` | `/api/movies/:id/shows` | Get upcoming shows grouped by theatre with availability indicators |
| `GET` | `/api/shows/:id/seats` | Get visual seat map with real-time seat availability (`AVAILABLE`, `HELD`, `BOOKED`, `MINE`) |

### Protected User Endpoints (Requires `token` cookie)
| Verb | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `POST`| `/api/shows/:id/hold` | Atomically hold 1–6 seats for 5 minutes |
| `DELETE`| `/api/shows/:id/hold` | Release current user's held seats |
| `POST`| `/api/bookings/checkout` | Create pending booking and Razorpay order |
| `POST`| `/api/bookings/verify` | Verify Razorpay HMAC signature and confirm booking |
| `POST`| `/api/bookings/failed` | Mark booking failed on client dismissal |
| `GET` | `/api/bookings/my` | List user bookings (tabs: `upcoming`, `past`, `cancelled`) |
| `GET` | `/api/bookings/:id` | View ticket details with QR code payload |
| `PATCH`| `/api/bookings/:id/cancel`| User cancellation with Razorpay refund (> 2 hrs before show) |
| `POST`| `/api/bookings/webhook` | Asynchronous Razorpay webhook event processor |

### Protected Admin Endpoints (Requires `admin` role)
| Verb | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Analytics dashboard (totals, 14-day revenue series, top movies, occupancy) |
| `GET` | `/api/admin/movies` | List all movies including archived |
| `POST`| `/api/admin/movies` | Create movie with poster/backdrop uploads |
| `PUT` | `/api/admin/movies/:id` | Update movie details |
| `DELETE`| `/api/admin/movies/:id` | Soft delete / archive movie |
| `GET` | `/api/admin/theatres` | List all theatres |
| `POST`| `/api/admin/theatres` | Create new theatre |
| `PUT` | `/api/admin/theatres/:id` | Update theatre info |
| `PATCH`| `/api/admin/theatres/:id/status`| Activate or deactivate theatre |
| `GET` | `/api/admin/screens` | List screens for a theatre |
| `POST`| `/api/admin/screens` | Create screen with row/category layout |
| `PUT` | `/api/admin/screens/:id` | Update screen layout |
| `GET` | `/api/admin/shows` | List shows with date and screen filters |
| `POST`| `/api/admin/shows` | Schedule new show with overlap validation |
| `PUT` | `/api/admin/shows/:id` | Reschedule show |
| `DELETE`| `/api/admin/shows/:id` | Cancel scheduled show |
| `GET` | `/api/admin/bookings` | View all customer bookings with status and date filters |
| `PATCH`| `/api/admin/bookings/:id/cancel` | Force cancel booking and issue refund |
| `GET` | `/api/admin/users` | List registered users with search and pagination |
| `PATCH`| `/api/admin/users/:id/status` | Activate/deactivate user (self-deactivation forbidden) |

---

## Postman Collection

A ready-to-import Postman collection is provided at:
[`backend/docs/ShowTime.postman_collection.json`](./docs/ShowTime.postman_collection.json)

Set the `baseUrl` collection variable to `http://localhost:8084` to test all routes out of the box.
