# PART B: BACKEND SPECIFICATION

## B1. Conventions and constants
These conventions apply to every backend file. Constants live in config/constants.js and must never be duplicated as magic numbers.

| Constant | Value | Used for |
| :--- | :--- | :--- |
| HOLD_MINUTES | 5 | Seat hold lifetime |
| CHECKOUT_HOLD_EXTENSION_MINUTES | 3 (hold never exceeds 8 minutes from creation) | Extends hold once at checkout so an in-progress payment is not cut off |
| MAX_SEATS_PER_BOOKING | 6 | Upper bound of seats per hold and booking |
| CANCEL_CUTOFF_HOURS | 2 | Cancellation allowed only if show starts later than now + 2h |
| SHOW_BUFFER_MINUTES | 15 | Gap required between two shows on the same screen |
| SHOW_ADS_MINUTES | 15 | Added to movie duration to compute show endTime |
| PENDING_BOOKING_EXPIRY_MINUTES | 10 | PENDING bookings older than this are expired by the job |
| FILLING_FAST_THRESHOLD | 0.30 | Availability label when 30 percent or fewer seats are free |
| BOOKING_WINDOW_DAYS | 7 (public) / 30 (admin can schedule) | How far ahead shows are listed and can be created |
| JWT_EXPIRES_IN / COOKIE_NAME | 7d / token | Auth cookie |
| DEFAULT_PAGE_LIMIT / MAX_PAGE_LIMIT | 12 / 50 | Pagination |
| BOOKING_REF_PREFIX | SHT | Booking reference, for example SHT-K7M2QX |
| TIMEZONE | Asia/Kolkata | All date-only inputs (YYYY-MM-DD) are interpreted in IST (+05:30) |
| CURRENCY | INR | Amounts are integers in rupees in the API; paise only when talking to Razorpay |

### Response envelope (every endpoint)
- Success: `{ "success": true, "message": "Movies fetched", "data": { ... } }`
- List: `{ "success": true, "message": "...", "data": { "items": [...], "pagination": { "page":1, "limit":12, "total":87, "pages":8 } } }`
- Error: `{ "success": false, "message": "Seats are no longer available", "code": "SEATS_UNAVAILABLE", "errors": [ { "field":"email", "message":"Invalid email" } ], "details": { ... } }`

Rules: ids are strings; dates are ISO 8601 UTC; JSON keys are camelCase; never return passwordHash, razorpay secrets or internal Mongo fields (__v).

---

## B2. Backend folder structure (file by file)
```
backend/
  package.json .env.example jest.config.js server.js app.js
  config/ env.js db.js cloudinary.js razorpay.js constants.js
  models/ User.js Movie.js Theatre.js Screen.js Show.js SeatHold.js BookedSeat.js Booking.js
  validators/ auth.validator.js movie.validator.js theatre.validator.js screen.validator.js
                show.validator.js booking.validator.js common.validator.js (objectId, pagination, date)
  services/ auth.service.js movie.service.js theatre.service.js screen.service.js seatLayout.service.js
                show.service.js seat.service.js booking.service.js payment.service.js ticket.service.js
                media.service.js report.service.js user.service.js refund.service.js
  controllers/ auth.controller.js movie.controller.js theatre.controller.js screen.controller.js
                show.controller.js seat.controller.js booking.controller.js payment.controller.js
                admin.controller.js
  views/ response.js user.view.js movie.view.js theatre.view.js screen.view.js show.view.js
                seat.view.js booking.view.js report.view.js
  routes/ index.js auth.routes.js movie.routes.js theatre.routes.js show.routes.js
                booking.routes.js payment.routes.js admin.routes.js
  middlewares/ authenticate.js optionalAuth.js authorizeRoles.js validate.js rateLimiter.js
                upload.js errorHandler.js notFound.js sanitize.js
  jobs/ index.js expirePending.job.js
  utils/ AppError.js catchAsync.js generateBookingRef.js pagination.js dateUtils.js escapeRegex.js objectId.js
  seed/ seedAdmin.js seedAll.js data/movies.js data/theatres.js
  tests/ setup.js auth.test.js catalogue.test.js seatLayout.test.js show.test.js
                hold.concurrency.test.js booking.test.js report.test.js
  docs/ ShowTime.postman_collection.json
```

---

## B3. Data models (field level)
All schemas use timestamps: true, strict mode, and toJSON transforms that remove __v. Required means required at schema level in addition to Zod validation at the edge.

### User
| Field | Type | Rules |
| :--- | :--- | :--- |
| name | String | required, trim, 2-60 chars |
| email | String | required, unique, lowercase, trim, valid email |
| passwordHash | String | required, select:false (never returned) |
| phone | String | optional, Indian mobile /^[6-9][0-9]{9}$/ |
| role | String | enum user \| admin, default user |
| isActive | Boolean | default true; false blocks login and all authenticated routes |
| lastLoginAt | Date | set on each login |

Indexes: unique(email).

### Movie
| Field | Type | Rules |
| :--- | :--- | :--- |
| title | String | required, trim, 1-120 |
| description | String | required, 10-2000 |
| genres | [String] | 1-4 items from: Action, Adventure, Animation, Biography, Comedy, Crime, Drama, Family, Fantasy, Horror, Musical, Mystery, Romance, Sci-Fi, Sports, Thriller, War |
| languages | [String] | 1-4 items from: Hindi, English, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Punjabi, Gujarati |
| formats | [String] | subset of 2D, 3D, IMAX, 4DX; default [2D] |
| durationMin | Number | integer 30-400 |
| releaseDate | Date | required |
| certificate | String | enum U \| UA \| A \| S |
| posterUrl, posterPublicId | String | required on create; Cloudinary secure URL and public id |
| backdropUrl, backdropPublicId | String | optional; falls back to posterUrl in views |
| trailerUrl | String | optional, valid http(s) URL |
| cast | [{name, role, imageUrl}] | max 12; name required 1-60; role optional (Actor, Director, Producer...) |
| status | String | enum now_showing \| coming_soon \| archived; default coming_soon |
| isDeleted | Boolean | default false; soft delete flag, excluded from all public queries |

Indexes: text(title), (status, releaseDate desc), (genres), (languages), (isDeleted).

### Theatre
| Field | Type | Rules |
| :--- | :--- | :--- |
| name | String | required, 2-80 |
| city | String | required, trimmed, stored in Title Case (Bengaluru, Mumbai) |
| address | String | required, 5-200 |
| amenities | [String] | optional, max 8 (Parking, Food Court, Wheelchair Access, M-Ticket, Recliners...) |
| isActive | Boolean | default true |

Indexes: unique(city, name).

### Screen
| Field | Type | Rules |
| :--- | :--- | :--- |
| theatre | ObjectId | ref Theatre required |
| name | String | required, 1-40 (for example Audi 1) |
| layout.rows[] | Array | 1-26 rows; each row object below |
| rows[].label | String | 1-2 uppercase letters, unique within the screen (A, B, ... AA) |
| rows[].seatCount | Number | integer 1-30 |
| rows[].category | String | uppercase 2-20 chars, for example SILVER, GOLD, PLATINUM |
| rows[].aisleAfter | [Number] | each value between 1 and seatCount-1; visual gap after that seat number |
| totalSeats | Number | computed in the service as sum of seatCount; stored |
| isActive | Boolean | default true |

Indexes: unique(theatre, name). Seat id = row label + seat number (A1, A2, ... B10).

### Show
| Field | Type | Rules |
| :--- | :--- | :--- |
| movie, screen, theatre | ObjectId | refs required; theatre is copied from screen.theatre |
| city | String | copied from theatre at creation for fast filtering |
| startTime | Date | required, must be in the future on create; within BOOKING_WINDOW (30 days admin) |
| endTime | Date | computed: startTime + movie.durationMin + SHOW_ADS_MINUTES |
| language, format | String | must be one of the movie's languages and formats |
| pricing | Map String->Number | must contain EVERY category present in screen.layout; each integer 50-5000 |
| status | String | enum scheduled \| cancelled \| completed; default scheduled |

Indexes: (movie, city, startTime), (screen, startTime, endTime), (theatre, startTime).

### SeatHold
| Field | Type | Rules |
| :--- | :--- | :--- |
| show | ObjectId | ref Show required |
| seatId | String | required (A1...) |
| user | ObjectId | ref User required |
| expiresAt | Date | required |

Indexes: UNIQUE(show, seatId); TTL index on expiresAt with expireAfterSeconds 0; (user, show).
IMPORTANT: Mongo's TTL monitor runs about every 60 seconds, so every read must filter expiresAt > now and every hold insert must first delete expired holds for the requested seats.

### BookedSeat
| Field | Type | Rules |
| :--- | :--- | :--- |
| show | ObjectId | required |
| seatId | String | required |
| booking | ObjectId | ref Booking required |

Indexes: UNIQUE(show, seatId) is the final arbiter against double booking; (booking).

### Booking
| Field | Type | Rules |
| :--- | :--- | :--- |
| bookingRef | String | unique, format SHT-XXXXXX from alphabet ABCDEFGHJKMNPQRSTUVWXYZ23456789 |
| user, show | ObjectId | refs required |
| seats[] | {seatId, category, price} | 1-6 items, price in rupees snapshot at checkout |
| amount | Number | integer rupees, sum of seat prices |
| currency | String | INR |
| status | String | enum PENDING \| CONFIRMED \| FAILED \| EXPIRED \| CANCELLED |
| expiresAt | Date | PENDING only: createdAt + 10 minutes |
| razorpay | {orderId, paymentId, signature} | orderId set at checkout; payment fields set on confirm |
| refund | {id, amount, status, at} | status: NONE \| PROCESSED \| PENDING \| FAILED |
| confirmedAt, cancelledAt, cancelReason | Date/String | set on transitions; cancelReason: USER \| ADMIN \| SEATS_LOST \| SHOW_CANCELLED |
| snapshot | {movieId, movieTitle, posterUrl, certificate, language, format, theatreName, theatreAddress, city, screenName, startTime} | copied at checkout so tickets stay correct even if catalogue data changes |

Indexes: unique(bookingRef), (user, status, createdAt desc), (show, status), unique sparse (razorpay.orderId), (status, expiresAt).

---

## B4. API contract (every endpoint)
Access legend: Public, Optional (auth if cookie present), User, Admin. All authenticated endpoints read the JWT from the httpOnly cookie named token.

### Health and auth
| Method and path | Access | Request | Success | Errors |
| :--- | :--- | :--- | :--- | :--- |
| GET /health | Public | - | 200 {status, uptime, time} | |
| POST /api/auth/register | Public | body {name, email, password, phone?} | 201 {user}; sets cookie | 400 VALIDATION_ERROR; 409 EMAIL_EXISTS |
| POST /api/auth/login | Public | body {email, password} | 200 {user}; sets cookie; updates lastLoginAt | 400; 401 INVALID_CREDENTIALS; 403 ACCOUNT_DISABLED |
| POST /api/auth/logout | Any | - | 200; clears cookie with same options | |
| GET /api/auth/me | User | - | 200 {user} | 401 UNAUTHENTICATED; 403 ACCOUNT_DISABLED |

### Public catalogue
| Method and path | Access | Request | Success | Errors |
| :--- | :--- | :--- | :--- | :--- |
| GET /api/movies | Public | query: search, genre, language, format, status (default now_showing), city, page, limit, sort (releaseDate\|title) | 200 {items:[movie card], pagination}. city filters to movies that have at least one future show in that city | 400 VALIDATION_ERROR |
| GET /api/movies/featured | Public | query: city? | 200 {items} up to 5 now_showing movies with backdrop, newest first | |
| GET /api/movies/:id | Public | - | 200 {movie full detail} | 400 INVALID_ID; 404 NOT_FOUND |
| GET /api/movies/:id/shows | Public | query: date (YYYY-MM-DD, required), city (required) | 200 {date, movie summary, theatres:[{theatre, shows:[show card]}]}; past shows excluded | 400; 404 |
| GET /api/cities | Public | - | 200 {items:[string]} distinct active theatre cities, sorted | |
| GET /api/theatres | Public | query: city | 200 {items} | 400 |
| GET /api/shows/:id | Public | - | 200 {show with movie, theatre, screen name, pricing, startTime} | 400; 404 |

### Seats and holds
| Method and path | Access | Request | Success | Errors |
| :--- | :--- | :--- | :--- | :--- |
| GET /api/shows/:id/seats | Optional | - | 200 {show summary, categories:[{name, price, rows:[{label, seats:[{id, number, status, aisleAfter}]}]}], counts:{total, available, held, booked}}; status AVAILABLE\|HELD\|BOOKED\|MINE | 404 NOT_FOUND |
| POST /api/shows/:id/hold | User | body {seatIds:[string] 1-6} | 201 {seatIds, expiresAt, amount, categories breakdown} | 400 VALIDATION_ERROR; 400 SHOW_IN_PAST; 404; 409 SEATS_UNAVAILABLE with details.unavailableSeatIds |
| GET /api/shows/:id/hold | User | - | 200 {hold:null} or {hold:{seatIds, expiresAt, amount}} (lets the client restore state after refresh) | 404 show |
| DELETE /api/shows/:id/hold | User | - | 200 releases the user's holds for the show | |

### Bookings and payments
| Method and path | Access | Request | Success | Errors |
| :--- | :--- | :--- | :--- | :--- |
| POST /api/bookings/checkout | User | body {showId} | 201 {booking summary, razorpay:{orderId, amountPaise, currency, keyId}} | 409 HOLD_NOT_FOUND or HOLD_EXPIRED; 502 PAYMENT_PROVIDER_ERROR; 429 |
| POST /api/bookings/verify | User | body {bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature} | 200 {ticket} (idempotent: repeat returns same ticket) | 400 INVALID_SIGNATURE; 404; 409 BOOKING_NOT_PAYABLE; 409 SEATS_UNAVAILABLE_REFUNDED |
| POST /api/bookings/:id/failed | User | body {reason?} | 200 marks PENDING booking FAILED and releases the user's holds | 404; 409 if already CONFIRMED |
| GET /api/bookings/my | User | query: tab (upcoming\|past\|cancelled), page, limit | 200 {items:[booking card], pagination} | 400 |
| GET /api/bookings/:id | User/Admin | - | 200 {ticket with qrDataUrl}; users only see their own | 404 (also for other users' bookings) |
| POST /api/bookings/:id/cancel | User | body {} | 200 {booking with refund} | 409 BOOKING_NOT_CANCELLABLE; 409 CANCEL_WINDOW_CLOSED; 404 |
| POST /api/payments/webhook | Razorpay | raw body + x-razorpay-signature header | 200 always after valid signature; handles payment.captured and payment.failed idempotently | 400 INVALID_SIGNATURE |

### Admin (all require Admin role)
| Method and path | Access | Request | Success | Errors |
| :--- | :--- | :--- | :--- | :--- |
| GET /api/admin/movies | Admin | query: search, status, page, limit | 200 {items, pagination} including archived, excluding soft deleted | |
| GET /api/admin/movies/:id | Admin | - | 200 {movie} | 404 |
| POST /api/admin/movies | Admin | multipart/form-data: fields + files poster (required), backdrop (optional); arrays sent as JSON strings | 201 {movie} | 400; 400 UPLOAD_ERROR; 502 UPLOAD_PROVIDER_ERROR |
| PUT /api/admin/movies/:id | Admin | multipart; files optional; replacing a file deletes the old Cloudinary asset | 200 {movie} | 400; 404 |
| DELETE /api/admin/movies/:id | Admin | - | 200 soft delete (isDeleted true, status archived) | 409 MOVIE_HAS_BOOKINGS if future shows with confirmed bookings |
| GET /api/admin/theatres | Admin | query: city, search, page, limit | 200 {items, pagination} | |
| POST /api/admin/theatres | Admin | body {name, city, address, amenities?} | 201 {theatre} | 400; 409 DUPLICATE |
| PUT /api/admin/theatres/:id | Admin | same as create | 200 {theatre} | 400; 404; 409 |
| PATCH /api/admin/theatres/:id/status | Admin | body {isActive} | 200 | 409 if deactivating with future confirmed bookings |
| GET /api/admin/screens | Admin | query: theatre, page, limit | 200 {items} with totalSeats | |
| POST /api/admin/screens | Admin | body {theatre, name, layout:{rows}} | 201 {screen} | 400 invalid layout; 404 theatre; 409 DUPLICATE |
| PUT /api/admin/screens/:id | Admin | same | 200 | 409 SCREEN_HAS_BOOKINGS if layout changes while future shows have bookings |
| GET /api/admin/shows | Admin | query: movie, theatre, date, status, page, limit | 200 {items} each with bookedCount and capacity | |
| POST /api/admin/shows | Admin | body {movie, screen, startTime, language, format, pricing:{CATEGORY:int}} | 201 {show} | 400; 400 SHOW_IN_PAST; 409 SHOW_OVERLAP with details.conflictingShow |
| PUT /api/admin/shows/:id | Admin | same fields | 200 | 409 SHOW_HAS_BOOKINGS if time, screen or pricing change after bookings exist; 409 SHOW_OVERLAP |
| DELETE /api/admin/shows/:id | Admin | query: cascade=true optional | 200 cancels the show; with cascade cancels and refunds all confirmed bookings | 409 SHOW_HAS_BOOKINGS without cascade |
| GET /api/admin/bookings | Admin | query: movie, theatre, status, from, to, email, page, limit | 200 {items, pagination, totals:{count, revenue}} | |
| GET /api/admin/bookings/:id | Admin | - | 200 {ticket + user} | 404 |
| PATCH /api/admin/bookings/:id/cancel | Admin | body {reason?} | 200 cancels and refunds, no time-window rule | 409 BOOKING_NOT_CANCELLABLE |
| GET /api/admin/users | Admin | query: search, role, page, limit | 200 {items, pagination} | |
| PATCH /api/admin/users/:id/status | Admin | body {isActive} | 200 | 400 CANNOT_DEACTIVATE_SELF |
| GET /api/admin/stats | Admin | query: days (default 14) | 200 {totals, perDay, topMovies, upcomingOccupancy, activeShows} | |

---

## B5. Validation rules (Zod schemas)
| Field | Rule |
| :--- | :--- |
| email | valid email, lowercased and trimmed, max 120 |
| password | 8-64 chars, at least one lowercase, one uppercase, one digit |
| name | 2-60 chars after trim, letters, spaces, dots, hyphens, apostrophes |
| phone | optional, /^[6-9][0-9]{9}$/ |
| ObjectId params | 24 hex chars, otherwise 400 INVALID_ID |
| page / limit | integers, page >= 1, 1 <= limit <= 50 (defaults 1 / 12) |
| date query | YYYY-MM-DD, valid calendar date, not before today (IST), not after today + 30 days |
| seatIds | array of 1-6 unique strings matching /^[A-Z]{1,2}[0-9]{1,2}$/ |
| movie.title / description | trimmed; HTML tags stripped; length limits as in B3 |
| movie multipart arrays | genres, languages, formats, cast arrive as JSON strings and are parsed then validated |
| pricing | object whose keys equal the screen's category set exactly; each value integer 50-5000 |
| screen layout | unique row labels; seatCount 1-30; aisleAfter values in 1..seatCount-1 and unique; at least 1 row and total seats <= 600 |
| startTime | ISO date-time, in the future, <= now + 30 days |
| razorpay fields | three non-empty strings; order id must match the booking's stored orderId |
| Mongo operator injection | sanitize middleware removes keys starting with $ or containing . from body, query and params |

---

## B6. Core algorithms (implement exactly)

### 1. Seat id generation (seatLayout.service)
```
generateSeats(layout):
  seats = []
  for row in layout.rows (in order):
    for n in 1..row.seatCount:
      seats.push({ id: row.label + n, row: row.label, number: n, category: row.category,
                   aisleAfter: row.aisleAfter.includes(n) })
  return seats // length equals sum of seatCount (pure function, unit tested)
```

### 2. Seat map (seat.service.getSeatMap)
```
show = Show.findById(id).populate(movie, theatre, screen); 404 if missing or status != scheduled
seats = generateSeats(show.screen.layout)
booked = Set(BookedSeat.find({show}).seatId)
holds = Map(SeatHold.find({show, expiresAt > now}) -> seatId => userId)
for each seat:
  status = BOOKED if booked.has(id)
         = MINE if holds.get(id) == currentUserId
         = HELD if holds.has(id)
         = AVAILABLE otherwise
group seats by category (keep layout order), then by row label
category.price = show.pricing[category]
counts = { total, available, held, booked } // MINE counts as held
```

### 3. Atomic hold (seat.service.holdSeats)
```
validate show: exists, status scheduled, startTime > now; seatIds unique, 1..6, all exist in generateSeats(layout)
SeatHold.deleteMany({ show, user }) // a user has one hold per show
SeatHold.deleteMany({ show, seatId: {$in: seatIds}, expiresAt: {$lte: now} }) // purge expired, TTL lags up to 60s
if BookedSeat.exists({ show, seatId: {$in: seatIds} }) -> 409 SEATS_UNAVAILABLE (details.unavailableSeatIds = those)
expiresAt = now + HOLD_MINUTES
try SeatHold.insertMany(seatIds.map(...), { ordered: false })
catch BulkWriteError code 11000:
   inserted = seatIds minus failed ids from writeErrors
   SeatHold.deleteMany({ show, user, seatId: {$in: inserted} }) // rollback = all or nothing
   throw 409 SEATS_UNAVAILABLE { unavailableSeatIds: failedIds }
amount = sum(show.pricing[category(seat)])
return { seatIds, expiresAt, amount }
```

### 4. Checkout (booking.service.checkout)
```
holds = SeatHold.find({ show, user, expiresAt > now }); if empty -> 409 HOLD_NOT_FOUND (or HOLD_EXPIRED)
old = Booking.find({ user, show, status: PENDING }) -> set EXPIRED (its Razorpay order is simply abandoned)
seats = holds.map(h => ({ seatId, category, price: show.pricing[category] })) // server-side price only
amount = sum(prices)
booking = Booking.create({ bookingRef, user, show, seats, amount, status: PENDING, expiresAt: now+10m, snapshot })
try order = razorpay.orders.create({ amount: amount*100, currency: 'INR', receipt: bookingRef, notes: {bookingId, showId} })
catch -> booking.status = FAILED; throw 502 PAYMENT_PROVIDER_ERROR
booking.razorpay.orderId = order.id; save
extend holds: expiresAt = min(max(current, now + 3m), holdCreatedAt + 8m)
return { booking summary, razorpay: { orderId, amountPaise, currency, keyId: RAZORPAY_KEY_ID } }
```

### 5. Verify and confirm (booking.service.verifyAndConfirm)
```
booking = Booking.findOne({ _id, user }); 404 if missing
if booking.status == CONFIRMED: return ticket(booking) // idempotent repeat
if booking.status in [FAILED, EXPIRED, CANCELLED]: 409 BOOKING_NOT_PAYABLE
if body.razorpay_order_id != booking.razorpay.orderId: 400 INVALID_SIGNATURE
expected = hex(HMAC_SHA256(RAZORPAY_KEY_SECRET, order_id + '|' + payment_id))
if !timingSafeEqual(expected, signature): 400 INVALID_SIGNATURE (booking stays PENDING, log the attempt)
session.withTransaction(():
   BookedSeat.insertMany(seats.map(s => ({show, seatId: s.seatId, booking})), { session }) // unique index decides
   SeatHold.deleteMany({ show, seatId: {$in: seatIds} }, { session })
   booking.status = CONFIRMED; paymentId; signature; confirmedAt = now; save({ session })
)
on duplicate key (E11000): payment succeeded but seats were taken ->
   refund = razorpay.payments.refund(paymentId, { amount: amountPaise })
   booking.status = FAILED; booking.refund = {...}; cancelReason = SEATS_LOST
   throw 409 SEATS_UNAVAILABLE_REFUNDED
return ticket(booking) // includes qrDataUrl
```

### 6. Cancel and refund
```
booking must be CONFIRMED else 409 BOOKING_NOT_CANCELLABLE
user cancel only: if show.startTime - now <= CANCEL_CUTOFF_HOURS -> 409 CANCEL_WINDOW_CLOSED
transaction: BookedSeat.deleteMany({ booking }); booking.status = CANCELLED; cancelledAt; cancelReason
after commit: refund = razorpay.payments.refund(paymentId, { amount: amountPaise, notes: { bookingRef } })
store refund {id, amount, status, at}; if refund API fails keep CANCELLED, refund.status = FAILED, log for manual retry
admin cancel uses the same flow without the time-window rule
```

### 7. Show overlap and end time (show.service)
```
endTime = startTime + movie.durationMin + SHOW_ADS_MINUTES
buffer = SHOW_BUFFER_MINUTES * 60000
conflict = Show.findOne({ screen, status: 'scheduled', _id: {$ne: currentId},
             startTime: { $lt: endTime + buffer }, endTime: { $gt: startTime - buffer } })
if conflict -> 409 SHOW_OVERLAP { conflictingShow: { id, movieTitle, startTime, endTime } }
```

### 8. Public shows by movie (show.service.listByMovie)
```
dayStart = new Date(date + 'T00:00:00+05:30'); dayEnd = dayStart + 24h; from = max(dayStart, now)
shows = Show.find({ movie, city, status: 'scheduled', startTime: { $gte: from, $lt: dayEnd } })
          .populate(theatre: name address amenities, screen: name totalSeats).sort(startTime)
bookedCounts = BookedSeat.aggregate([ {$match:{show:{$in:ids}}}, {$group:{_id:'$show', n:{$sum:1}}} ])
heldCounts = SeatHold.aggregate([ {$match:{show:{$in:ids}, expiresAt:{$gt:now}}}, {$group:{_id:'$show', n:{$sum:1}}} ])
free = totalSeats - booked - held
availability = free == 0 ? SOLD_OUT : free/totalSeats <= 0.30 ? FILLING_FAST : AVAILABLE
group by theatre (theatres sorted by name); show card = { id, startTime, language, format, screenName,
            pricing, priceFrom, priceTo, availability }
```

### 9. Booking reference and payments
```
bookingRef = 'SHT-' + 6 random chars from 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' (crypto.randomInt); retry on duplicate key up to 5 times
Razorpay amount = rupees * 100 (integer); receipt = bookingRef (max 40 chars)
Webhook: verify x-razorpay-signature = HMAC_SHA256(webhookSecret, rawBody); payment.captured -> run confirm logic if booking still PENDING; payment.failed -> markFailed
```

### 10. Expiry job (runs every minute)
```
pending = Booking.find({ status: PENDING, expiresAt: {$lt: now} })
for each: status = EXPIRED; SeatHold.deleteMany({ show, user, seatId: {$in: seatIds} })
log count; never throw out of the cron callback (wrap in try/catch)
```

### 11. Reporting aggregations (report.service)
```
totals: Booking.aggregate([{$match:{status:'CONFIRMED'}},{$group:{_id:null, revenue:{$sum:'$amount'}, bookings:{$sum:1}, tickets:{$sum:{$size:'$seats'}}}}])
perDay: match CONFIRMED and confirmedAt >= startOfDay(now - days) ; group by $dateToString {format:'%Y-%m-%d', date:'$confirmedAt', timezone:'Asia/Kolkata'}
          then fill missing days with zeros in code so the chart has a continuous x-axis
topMovies: match CONFIRMED; group by snapshot.movieId (sum amount, count) ; sort revenue desc ; limit 5 ; $lookup movie title and poster
activeShows: Show.countDocuments({ status:'scheduled', startTime: {$gt: now} })
upcomingOccupancy: next 10 shows by startTime with booked/totalSeats percentage (two grouped counts, merged in code)
```

### 12. Media upload (media.service)
```
multer memoryStorage, limits fileSize 5 MB, accept image/jpeg, image/png, image/webp only (else 400 UPLOAD_ERROR)
cloudinary.uploader.upload_stream({ folder: 'showtime/movies', transformation: [{ width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] })
return { url: secure_url, publicId: public_id }; on movie update with new image: destroy the old publicId after the DB save succeeds
if the DB write fails after an upload, destroy the newly uploaded asset (no orphans)
```

---

## B7. Error code catalogue
| Code | HTTP | When |
| :--- | :--- | :--- |
| VALIDATION_ERROR | 400 | Zod validation failed; errors[] lists field messages |
| INVALID_ID | 400 | Malformed ObjectId |
| UPLOAD_ERROR | 400 | Wrong mime type, too large, missing required file |
| SHOW_IN_PAST | 400 | Hold, create or edit for a show that already started |
| INVALID_SIGNATURE | 400 | Razorpay signature mismatch |
| UNAUTHENTICATED | 401 | No cookie or invalid or expired JWT |
| INVALID_CREDENTIALS | 401 | Wrong email or password (same message for both) |
| FORBIDDEN | 403 | Role not allowed |
| ACCOUNT_DISABLED | 403 | User isActive is false |
| NOT_FOUND | 404 | Resource missing or not owned by caller |
| EMAIL_EXISTS / DUPLICATE | 409 | Unique constraint violated |
| SEATS_UNAVAILABLE | 409 | One or more seats held or booked; details.unavailableSeatIds |
| HOLD_NOT_FOUND / HOLD_EXPIRED | 409 | Checkout without an active hold |
| SHOW_OVERLAP | 409 | Another show on the screen overlaps; details.conflictingShow |
| SHOW_HAS_BOOKINGS / SCREEN_HAS_BOOKINGS / MOVIE_HAS_BOOKINGS | 409 | Edit or delete blocked by confirmed bookings |
| CANCEL_WINDOW_CLOSED | 409 | Within 2 hours of showtime |
| BOOKING_NOT_CANCELLABLE / BOOKING_NOT_PAYABLE | 409 | Illegal state transition |
| SEATS_UNAVAILABLE_REFUNDED | 409 | Paid but seats lost; automatic refund issued |
| RATE_LIMITED | 429 | Too many requests; Retry-After header set |
| PAYMENT_PROVIDER_ERROR / UPLOAD_PROVIDER_ERROR | 502 | Razorpay or Cloudinary failed |
| SERVER_ERROR | 500 | Unexpected; generic message in production, stack only in development |

The errorHandler must also translate: Mongoose ValidationError -> 400, CastError -> 400 INVALID_ID, duplicate key 11000 -> 409, JsonWebTokenError and TokenExpiredError -> 401, MulterError -> 400 UPLOAD_ERROR.

---

## B8. Security and middleware order
```
app.set('trust proxy', 1) // required on Render for secure cookies
helmet()
cors({ origin: allowlist(CLIENT_URL, http://localhost:5173), credentials: true })
morgan('dev' | 'combined')
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.webhook) // BEFORE json parser
express.json({ limit: '1mb' }); express.urlencoded({ extended: true }); cookieParser(); sanitize
global rateLimiter 300 req / 15 min / IP
routes: /health, /api/auth (limiter 10 / 15 min on login and register), /api/movies, /api/theatres, /api/cities, /api/shows, /api/bookings (limiter 20 / 15 min on checkout and verify), /api/admin
notFound -> errorHandler
```
- Cookie options: `httpOnly: true, secure: production, sameSite: production ? 'none' : 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000`; identical options when clearing.
- JWT payload `{sub: userId, role}`; verify then re-load the user from DB on every request so deactivation takes effect immediately.
- Never log request bodies containing passwords, tokens or Razorpay secrets. Mask emails in error logs.
- Login returns the same message for unknown email and wrong password; bcrypt compare even when the user is missing (dummy hash) to reduce timing leaks.
- Admin routes: `router.use(authenticate, authorizeRoles('admin'))`. Ownership checks happen in services, not controllers.
- Razorpay key secret and Cloudinary secret exist only in backend env vars.

---

## B9. Seed data specification
- Admin: from `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars. Demo user: `demo@showtime.test` / `Demo@1234` (documented in README only).
- Cities and theatres (4 theatres): Bengaluru (Orion Cinemas, Galaxy Multiplex), Mumbai (Regal Screens), Delhi NCR (Star Cinema). Each has 2 screens.
- Screen layout A (Audi 1): rows A-C PLATINUM 10 seats aisleAfter [5]; rows D-H GOLD 14 seats aisleAfter [4,10]; rows J-M SILVER 16 seats aisleAfter [4,12].
- Screen layout B (Audi 2): rows A-B PLATINUM 8 seats aisleAfter [4]; rows C-G GOLD 12 seats aisleAfter [6]. (Skip row letter I to avoid confusion with 1.)
- 10 movies: 7 now_showing and 3 coming_soon, original fictional titles and descriptions, mixed genres, languages, formats, certificates, durations 95-175 minutes, placeholder poster and backdrop images, cast of 4.
- Shows: for the next 7 days at 10:00, 13:30, 17:00, 20:30 IST across screens, rotating movies, pricing SILVER 150, GOLD 250, PLATINUM 350 (IMAX shows plus 100).
- Seed script is idempotent and refuses to wipe data unless `SEED_CONFIRM=true`.

---

## B10. Backend test matrix (Jest + Supertest + mongodb-memory-server replica set)
| Area | Cases that must exist |
| :--- | :--- |
| Auth | register ok; duplicate email 409; weak password 400; login ok sets httpOnly cookie; wrong password 401; deactivated user 403; /me without cookie 401; logout clears cookie; user hitting admin route 403 |
| Catalogue | admin creates movie with mocked Cloudinary; non-admin 403; list filters and pagination; soft delete hides from public; delete blocked with bookings; theatre unique(city,name); screen layout validation |
| Seat layout | ids generated in order; aisle flags; total equals sum; invalid layout rejected |
| Shows | overlap rejected incl. buffer; adjacent outside buffer ok; past rejected; pricing missing a category rejected; endTime computed; public listing groups by theatre; availability labels |
| Holds | 20 parallel holds on one seat -> exactly one 201; multi-seat partial conflict leaves zero holds; re-hold replaces own hold; expired hold ignored and purged; booked seat 409; seat map statuses AVAILABLE/HELD/BOOKED/MINE |
| Booking | checkout without hold 409; amount computed server-side ignoring client; verify valid signature confirms; verify twice idempotent; tampered signature 400; other user's booking 404; expiry job expires pending; cancel inside window 409; cancel ok releases seats and records refund (Razorpay mocked); seats-lost path refunds |
| Reports | stats totals match seeded bookings; perDay has continuous dates; admin booking filters |
