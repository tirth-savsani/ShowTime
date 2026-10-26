# PART C: FRONTEND SPECIFICATION

## C1. Frontend folder structure (file by file)
```
frontend/vite-project/
  index.html vite.config.js tailwind.config.js postcss.config.js vercel.json .env.example
  src/
    main.jsx App.jsx index.css
    api/ axios.js auth.api.js movie.api.js show.api.js booking.api.js admin.api.js
    store/ index.js authSlice.js citySlice.js bookingSlice.js
    routes/ AppRoutes.jsx ProtectedRoute.jsx AdminRoute.jsx
    layouts/ MainLayout.jsx (header + nav + footer) MinimalLayout.jsx (header only, for seats and checkout) AdminLayout.jsx
    hooks/ useDebounce.js useCountdown.js useInterval.js useRazorpay.js useQueryParams.js useClickOutside.js
    utils/ formatters.js constants.js validators.js storage.js seatUtils.js
    components/
      common/ Button Modal Skeleton Spinner EmptyState ErrorState Pagination Badge Chip Tooltip ConfirmDialog
                 FormField Select Tabs Dropdown Toast config ImageUpload
      layout/ Header SearchBar CityModal SecondaryNav Footer UserMenu AuthModal
      movie/ MoviePosterCard MovieRow HeroCarousel FilterSidebar CastRow TrailerModal MovieHero
      shows/ DateStrip ShowFilters TheatreShowCard TimePill
      seats/ SeatMap SeatCategory SeatRow Seat SeatLegend ScreenCurve SeatCountModal SeatBottomBar
      booking/ BookingSummaryCard PriceBreakdown CountdownBanner TicketCard BookingListCard CancelDialog
      admin/ AdminSidebar AdminTopbar StatCard DataTable MultiSelect LayoutBuilder SeatPreview BarChart LineChart
    pages/ Home Explore MovieDetail Shows SeatSelection Checkout Confirmation MyBookings Login Register NotFound AccessDenied
    pages/admin/ Dashboard Movies MovieForm Theatres TheatreForm Screens ScreenForm Shows ShowForm Bookings Users
```

---

## C2. Route map
| Path | Page | Layout | Guard |
| :--- | :--- | :--- | :--- |
| / | Home | Main | Public |
| /explore/movies | Explore (query params: genre, language, format, tab, q, page) | Main | Public |
| /movies/:id | MovieDetail | Main | Public |
| /movies/:id/shows | Shows (query param: date) | Main | Public (sign-in prompt when picking a show) |
| /shows/:showId/seats | SeatSelection | Minimal | ProtectedRoute |
| /checkout/:showId | Checkout | Minimal | ProtectedRoute |
| /booking/:id/confirmation | Confirmation (ticket) | Main | ProtectedRoute |
| /my-bookings | MyBookings (query param: tab) | Main | ProtectedRoute |
| /login, /register | Auth pages (also open as modal) | Main | Guests only; logged-in users redirect to / |
| /admin | Dashboard | Admin | AdminRoute |
| /admin/movies, /new, /:id/edit | Movies list and MovieForm | Admin | AdminRoute |
| /admin/theatres, /new, /:id/edit | Theatres list and TheatreForm | Admin | AdminRoute |
| /admin/screens, /new, /:id/edit | Screens list and ScreenForm with LayoutBuilder | Admin | AdminRoute |
| /admin/shows, /new, /:id/edit | Shows list and ShowForm | Admin | AdminRoute |
| /admin/bookings | Bookings | Admin | AdminRoute |
| /admin/users | Users | Admin | AdminRoute |
| * | NotFound | Main | Public |

- **ProtectedRoute**: while auth status is loading show a full-page spinner; if guest, store the intended path in authSlice.redirectTo, open the AuthModal and navigate to /. After login navigate to redirectTo.
- **AdminRoute**: guest -> sign-in; non-admin -> AccessDenied page with a Back to Home button.

---

## C3. State management and data layer

### Redux slices
- `authSlice`: `{ user: null | {id,name,email,phone,role}, status: 'idle'|'loading'|'authenticated'|'guest', error: null, authModal: { open: false, mode: 'login'|'register' }, redirectTo: null }`
  thunks: `fetchMe`, `login`, `register`, `logout` (`fetchMe` runs once on app start)
- `citySlice`: `{ selected: string|null (persisted in localStorage 'showtime_city'), list: string[], modalOpen: boolean }`
  first visit with no city: CityModal opens automatically and cannot be closed until a city is picked
- `bookingSlice`: `{ showId, seatCount: 1..6|null, selectedSeatIds: string[], hold: {seatIds, expiresAt, amount}|null, bookingId|null }`
  persisted to sessionStorage so a refresh on seats or checkout restores the flow; cleared after confirmation or release

### API layer rules
- axios instance: `baseURL = import.meta.env.VITE_API_URL`, `withCredentials: true`, `timeout: 20000`.
- Response interceptor: unwrap `response.data.data`; normalise errors to `{ status, code, message, details }`. On 401 (except from `/auth/me` and `/auth/login`) dispatch logout state and open the AuthModal. On network error show toast 'Network error. Check your connection.'
- One function per endpoint in the `*.api.js` files returning plain data; no component calls axios directly.
- Page-level data fetching with `useEffect` + local state `{ data, loading, error }`, with request cancellation (AbortController) when params change or the component unmounts.
- `useDebounce(value, 350ms)` for search; `useInterval` for seat polling (clears on unmount and when the tab is hidden via `document.visibilityState`).
- `useCountdown(expiresAt)` returns `{ minutes, seconds, expired, remainingMs }` using the server timestamp; compute drift once from the response Date header so client clock errors do not matter.

### utils/formatters.js (all pure, unit-testable)
- `formatCurrency(n)` -> 'Rs. 250' (no decimals; thousands separated Indian style, for example Rs. 1,250).
- `formatDate(iso)` -> 'Fri, 31 Oct 2026'; `formatShortDate` -> '31 Oct'; `formatTime(iso)` -> '07:30 PM' (always Asia/Kolkata); `formatDuration(min)` -> '2h 15m'.
- `formatDateTime` -> 'Fri, 31 Oct | 07:30 PM'. Date strip uses day abbreviation (FRI), date number (31) and month abbreviation (OCT).
- `seatsToText(['A1','A2'])` -> 'A1, A2'. `certificateLabel`: U -> 'U', UA -> 'UA', A -> 'A', S -> 'S'.

---

## C4. Design tokens (exact values)
| Token | Value |
| :--- | :--- |
| Font | Roboto 400, 500, 700 from Google Fonts; fallback system-ui, sans-serif |
| Colours | primary #F84464; primary-dark #E03556; navy #333545; navy-light #404258; ink #1F2533; muted #666C7A; border #E5E7EB; page-bg #F5F5F5; card #FFFFFF; seat-green #1EA83C; time-green #4ABD5D; orange #FFA500; sold-grey #DEDEDE; success #1EA83C; danger #D32F2F; star-yellow not used |
| Type scale | 4px base: 4, 8, 12, 16, 24, 32, 48, 64. h1 28/36 bold; section title 22/28 bold; card title 16/22 medium; body 14/20 regular; small 12/16; micro 11/14 (badges) |
| Spacing / Container | max-width 1240px, centred, horizontal padding 24px desktop, 16px mobile |
| Radius | 4px (pills, inputs), 6px (buttons), 8px (cards, posters), 12px (modals), 999px (chips, avatars) |
| Shadows | card 0 1px 3px rgba(0,0,0,0.12); hover 0 6px 16px rgba(0,0,0,0.16); modal 0 12px 32px rgba(0,0,0,0.24) |
| Header | height 64px white, bottom border 1px #E5E7EB, sticky top, z-index 40 |
| Secondary nav | height 40px, background #333545, text #FFFFFF 13px, hover underline |
| Buttons | height 40px, padding 0 20px, radius 6px; primary: bg #F84464 white text 14px/500, hover #E03556; secondary: white bg, 1px #F84464 border, red text; ghost: transparent; disabled: opacity 0.5, cursor not-allowed; loading shows spinner and keeps width |
| Inputs | height 44px, border 1px #D1D5DB, radius 4px, focus border #F84464 + 2px ring rgba(248,68,100,0.25); error border #D32F2F with 12px red message below |
| Poster card | width 220px desktop, 160px tablet, 140px mobile; poster aspect-ratio 2/3, radius 8px; bottom strip height 32px with gradient rgba(0,0,0,0.85) to transparent; gap 24px (16px mobile) |
| Hero carousel | height 400px desktop, 280px tablet, 200px mobile; radius 8px; autoplay 5s; dots 8px |
| Time pill | min-width 88px, height 36px, padding 0 16px, border 1px #A5A5A5, radius 4px, text #4ABD5D 13px/500; hover bg #F0FBF1; filling-fast text and border #FFA500; sold-out text #9CA3AF border #E5E7EB cursor not-allowed |
| Date strip item | 52px x 64px, radius 6px; selected bg #F84464 white text; unselected white bg, ink text; shows day (FRI), date (31), month (OCT) in 11/18/11 px |
| Seat | 28px square desktop (24px under 640px), radius 4px, 6px gap, number 11px; available: white bg border 1px #1EA83C text #1EA83C; selected: bg #1EA83C white text; booked/held-by-others: bg #DEDEDE border #DEDEDE text #9CA3AF not clickable; aisle gap 20px; row label column 24px muted |
| Screen indicator | curved SVG arc, width 60 percent of the seat grid, stroke #A5A5A5, caption 'All eyes this way please!' 12px muted |
| Modal | max-width 480px (city modal 720px), radius 12px, overlay rgba(0,0,0,0.6), closes on Esc and overlay click unless marked blocking |
| Toasts | react-hot-toast, top-center, 4s, white card with 4px left border (green success, red error) |
| Breakpoints | sm 640, md 768, lg 1024, xl 1280 (Tailwind defaults) |

---

## C5. Shared component specifications
- **Header**: Logo (red ShowTime wordmark, text-only SVG) links to /. SearchBar centre (max 560px). City selector button (map-pin icon, city name, caret). Right: Sign in button or UserMenu. Under 768px: logo, city button, avatar icon on the first row; SearchBar on a second full-width row.
- **SearchBar**: Input with leading search icon, placeholder 'Search for Movies, Theatres and more'. After 2 characters and 350ms debounce fetch `/api/movies?search=&limit=6&status=now_showing`; dropdown lists poster thumbnail (40x60), title, genres. Up/Down arrows move, Enter opens movie or the Explore page with q, Esc closes. Empty result shows 'No results for "q"'. Closes on outside click.
- **CityModal**: Search input filters list. 'Popular Cities' grid of tiles (text tiles with city name; first 6 from API). 'Other Cities' as a text list. Selecting stores city, closes modal and refetches data. Blocking on first visit.
- **AuthModal**: Tabs-less switch: Login view and Register view with a link to toggle. Opens from Sign in, from ProtectedRoute, from 401. Shows server errors under the form. Closes on success.
- **UserMenu**: Avatar circle with initials (red bg). Dropdown: user name and email, My Bookings, Admin Panel (admin only), Logout. Closes on outside click and Esc.
- **Footer**: Navy block: 4 link columns (About, Help, Cities, Follow us text links), disclaimer line, copyright. Static content.
- **MoviePosterCard**: Link to `/movies/:id`. Poster img with lazy loading and onError fallback tile showing the title. Bottom gradient strip shows certificate chip and first language. Title 16px bold one line with ellipsis. Genres 14px muted one line. Hover lifts 2px.
- **MovieRow**: Title 22px bold, 'See All >' red link, horizontal scroll container with snap, hidden scrollbar, round arrow buttons at both ends on desktop (disabled at the ends), touch scrolling on mobile.
- **HeroCarousel**: Slides from `/api/movies/featured`. Each slide is a link to the movie. Gradient overlay with title and 'Book now' on the left bottom. Arrows on hover, dots, pause on hover, swipe on touch. One slide hides arrows and dots.
- **FilterSidebar**: Collapsible sections Languages, Genres, Format with chip toggles. Selected chips red fill. 'Clear all' appears when any filter set. Mobile: opens as bottom sheet from a Filters button with Apply and Reset.
- **Skeleton**: Grey (#E5E7EB) shimmer blocks matching the final layout (poster cards, rows, list rows, table rows) for every async view.
- **EmptyState**: Icon, title, one-line hint and optional action button. ErrorState: message from the error plus Retry button.
- **Pagination**: Prev, page numbers with ellipsis, Next; keyboard accessible; hides when pages <= 1.
- **ConfirmDialog**: Title, body, Cancel and Confirm (red) buttons, loading state on confirm.
- **DataTable (admin)**: Columns config, sticky header, row hover, loading skeleton rows, empty state, server pagination, optional search input with debounce and filter slots, row actions menu.
- **ImageUpload**: Click or drag and drop, accepts jpeg, png, webp up to 5 MB, shows preview with remove button, validation messages for type and size, existing URL shown when editing.
- **LayoutBuilder**: Rows editor: Add row, Remove row, Move up and down, per row: label (auto A, B, C...), seat count, category select with free text, aisle positions (comma separated numbers). Live SeatPreview using the same Seat components in disabled mode. Shows total seats and the category list that drives the ShowForm pricing fields.

---

## C6. Page specifications (user side)

### Home (/)
- Data: `GET /api/movies/featured?city`, `GET /api/movies?status=now_showing&city&limit=12`, `GET /api/movies?status=coming_soon&limit=12`, `GET /api/cities`.
- Layout: Header, SecondaryNav, HeroCarousel, section 'Recommended Movies' (MovieRow with See All -> `/explore/movies?tab=now_showing`), section 'Coming Soon' (See All -> `?tab=coming_soon`), Footer.
- Interactions: Poster click -> movie detail. Hero click -> movie detail. Arrows scroll rows by one viewport. Changing city refetches all sections.
- States: Loading: hero skeleton + 6 poster skeletons per row. Empty: 'No movies are playing in <city> right now' with a Change city button. Error: ErrorState with Retry per section.
- Edge cases: No featured movies -> hide hero. City not chosen -> CityModal blocks. Image load failure -> fallback tile.

### Explore Movies (/explore/movies)
- Data: `GET /api/movies` with query params mirrored in the URL (genre, language, format, status via tab, q, page, limit 12).
- Layout: Breadcrumb Home > Movies. Left FilterSidebar 260px (desktop), right: tabs Now Showing / Coming Soon, active filter chips row, results count, poster grid 4 columns (xl), 3 (lg), 2 (md), 2 (sm), Pagination.
- Interactions: Filter chips update the URL and refetch (debounced); browser back restores filters; tab switch resets page to 1; clear all resets.
- States: Loading: 8 skeleton cards. Empty: 'No movies match your filters' with Clear filters. Error: Retry.
- Edge cases: Invalid page param -> page 1. Filter values not in enum ignored. Very long titles truncated.

### Movie Detail (/movies/:id)
- Data: `GET /api/movies/:id`.
- Layout: MovieHero: full-width block, backdrop image with dark overlay rgba(26,26,26,0.85) and blur(2px); container with poster 261x392 radius 8 on the left; right column: title 28px white, chips row (formats e.g. 2D, IMAX; languages), line 'duration · genres · certificate · release date' in white 16px, red Book tickets button (large 48px). Below hero: About the movie (22px title, paragraph), Cast row (circular 96px avatars with name and role; initials fallback), optional Watch Trailer button.
- Interactions: Book tickets -> `/movies/:id/shows?date=today`. Trailer opens TrailerModal embedding YouTube (convert watch URL to embed URL) or opens link in new tab for other hosts. Share button copies the URL and toasts 'Link copied'.
- States: Loading: hero skeleton. 404: NotFound-style message with Back to Home. Error: Retry.
- Edge cases: `coming_soon`: replace Book tickets with disabled grey button 'Releasing on <date>'. `archived` movie: show 'No longer showing'. Missing backdrop -> use poster blurred.

### Showtimes (/movies/:id/shows)
- Data: `GET /api/movies/:id` (header info) and `GET /api/movies/:id/shows?date&city`; refetch on date or city change.
- Layout: Breadcrumb Home > Movies > Title. Movie title 28px, certificate chip, genre chips. DateStrip sticky below header (7 days from today, horizontally scrollable on mobile). Filter bar: Language, Price Range (Rs. 0-150, 151-250, 251-350, 351+), Preferred Time (Morning before 12, Afternoon 12-16, Evening 16-19, Night after 19) as dropdowns with checkboxes; plus legend: Available (green), Filling fast (orange), Sold out (grey). Theatre cards: name bold, amenities as small icons or text, grid of TimePills with format label under each pill.
- Interactions: Date click updates `?date=` and refetches. Filters apply client-side to fetched shows and hide empty theatres. Hover/focus on a pill shows Tooltip listing category prices. Clicking an available pill: guest -> AuthModal then continue; user -> stores showId in bookingSlice and navigates to `/shows/:showId/seats`.
- States: Loading: 3 theatre skeleton cards. Empty: 'No shows available for this date' + hint to pick another date. Error: Retry.
- Edge cases: Past shows never appear. City with no theatres -> 'We do not show this movie in <city>' and Change city. Selected date in the past via URL -> reset to today.

### Seat Selection (/shows/:showId/seats)
- Data: `GET /api/shows/:id/seats` (initial + polling every 10s while tab visible), `GET /api/shows/:id/hold` (restore), `POST /api/shows/:id/hold`, `DELETE /api/shows/:id/hold`.
- Layout: MinimalLayout. Top bar (white, 56px): back arrow, movie title 18px bold, line 'Theatre | Day, Date | Time' 13px muted, right side 'N Tickets' outlined button to reopen SeatCountModal. Body: centred seat grid inside a horizontally scrollable container; for each category: label line 'Rs. 250 GOLD' with a 1px divider; rows with left label, seats with aisle gaps; below all rows ScreenCurve and caption; SeatLegend (Available, Selected, Sold). Sticky bottom bar (white, shadow) appears when selected count equals chosen count: 'Pay Rs. X' red full-width button (max 480px) with seat summary on the left on desktop.
- Interactions: Entry: SeatCountModal (1-6 buttons with big numerals, selected red, default 2, Select Seats button). Clicking an AVAILABLE seat toggles selection; selecting beyond the chosen count toasts 'You can select only N seats'; a seat may only be clicked if status AVAILABLE or MINE. Pay -> POST hold: success stores hold in bookingSlice and navigates to `/checkout/:showId`; 409 -> toast 'Seats X, Y were just taken', unselect those, refresh map. Polling updates statuses without clearing the user's valid selections; selected seats that became unavailable are removed with a toast. Back button releases an existing hold (DELETE) then navigates back.
- States: Loading: grey grid skeleton. Error: Retry. Show started or cancelled: message 'This show is no longer available' with link to showtimes. If an active hold exists on load (GET hold): preselect those seats and show a banner with the countdown.
- Edge cases: Refresh keeps seatCount from sessionStorage. Very wide rows scroll horizontally with seats never shrinking below 24px. Seats under 640px use 24px size. Double clicking Pay is prevented by loading state. Session expiry (401) opens AuthModal and returns here.

### Checkout (/checkout/:showId)
- Data: `bookingSlice.hold` (restored by `GET /api/shows/:id/hold` if missing), `GET /api/shows/:id`, `POST /api/bookings/checkout`, `POST /api/bookings/verify`, `POST /api/bookings/:id/failed`.
- Layout: MinimalLayout, two columns on desktop (summary 60 percent, payment panel 40 percent), stacked on mobile. CountdownBanner on top (yellow-tinted bar) 'Complete your payment in 04:32' turning red under 60 seconds. BookingSummaryCard: poster thumbnail 80x120, movie title, certificate, language and format, date and time, theatre and screen, seat list with category. PriceBreakdown: lines per category (qty x price), subtotal, convenience fee Rs. 0 (shown as 'Free'), total bold. Payment panel: total and red 'Pay Rs. X' button, line 'Test mode: use Razorpay test card 4111 1111 1111 1111, any future expiry, any CVV'. Terms note.
- Interactions: Pay: POST checkout -> load `https://checkout.razorpay.com/v1/checkout.js` once (`useRazorpay` hook) -> open Razorpay with key, order_id, amount, name 'ShowTime', prefill name and email, theme color #F84464. handler -> POST verify with the three Razorpay values -> on success clear booking state and navigate to `/booking/:id/confirmation` (replace). modal.ondismiss -> POST /failed, toast 'Payment cancelled', stay on page with Pay enabled again. payment.failed event -> toast with Razorpay error description. Countdown reaches zero -> blocking modal 'Your seats were released' with Select seats again.
- States: Loading: skeleton summary. Error on checkout call: toast with server message; 409 HOLD_EXPIRED -> same expired modal. Verify error SEATS_UNAVAILABLE_REFUNDED -> modal explaining a refund was issued with a Back to showtimes button. Verify network failure after payment -> show a persistent 'Confirming your payment...' state with Retry and a link to My Bookings.
- Edge cases: Refresh restores the page from sessionStorage and hold endpoint. Leaving via back releases the hold only if no payment is in progress. Pay button disabled while loading or expired.

### Confirmation / Ticket (/booking/:id/confirmation)
- Data: `GET /api/bookings/:id` (ticket with qrDataUrl).
- Layout: Green circle with tick animation, 'Booking Confirmed' title, subtitle 'Booking ID SHT-XXXXXX'. TicketCard (white, radius 12): left section movie poster, title, certificate, language and format, date and time, theatre, screen, seats; dashed vertical or horizontal tear line with semicircle notches; right section QR code 160px and booking ref; footer line amount paid and payment id (last 6 chars). Buttons: Print ticket (window.print with @media print hiding header, footer and buttons), My Bookings, Back to Home.
- Interactions: Print stylesheet shows only the ticket card at A5 size. Copy booking ID on click.
- States: Loading: ticket skeleton. 404 or not owner: 'Ticket not found'. Status CANCELLED shows a red Cancelled ribbon and refund info; PENDING shows 'Payment is being confirmed' with auto-retry every 3s up to 10 times.
- Edge cases: Direct visit from My Bookings uses the same page. Missing QR -> text booking ref only.

### My Bookings (/my-bookings)
- Data: `GET /api/bookings/my?tab&page&limit=10`, `POST /api/bookings/:id/cancel`.
- Layout: Page title 'My Bookings', Tabs Upcoming / Past / Cancelled (synced to ?tab). BookingListCard rows: poster thumbnail, movie title, theatre, date and time, seats, amount, status Badge (green CONFIRMED, red CANCELLED, grey Completed), buttons View Ticket and Cancel (Upcoming only). Pagination.
- Interactions: Cancel opens CancelDialog: shows refund amount, policy text 'Cancellation allowed up to 2 hours before showtime', Confirm calls cancel; success toast 'Booking cancelled. Refund of Rs. X initiated' and the card moves to Cancelled. Cancel hidden or disabled with tooltip when within 2 hours.
- States: Loading: 3 skeleton rows. Empty per tab: 'No upcoming bookings' with Browse movies button. Error: Retry.
- Edge cases: 409 CANCEL_WINDOW_CLOSED -> toast and refetch. Refund status FAILED shown as 'Refund pending, contact support'.

### Auth modal and pages (modal + /login + /register)
- Data: `POST /api/auth/login`, `POST /api/auth/register`.
- Layout: Modal 420px: title 'Sign in' or 'Create account', fields, red primary button full width, toggle link, close X. Register fields: Full name, Email, Mobile number (optional), Password with show/hide eye and strength hint, Confirm password.
- Interactions: Validate on blur and on submit using `utils/validators.js` (same rules as backend B5). Submit disables the button and shows spinner. Server field errors (`VALIDATION_ERROR errors[]`) map to fields; EMAIL_EXISTS shows under email; INVALID_CREDENTIALS shows a form-level error. Enter key submits.
- States: Loading on submit; success toast 'Welcome, <name>'. Failure keeps entered values except passwords.
- Edge cases: Already authenticated visiting /login -> redirect /. Network error toast.

---

## C7. Page specifications (admin side)
AdminLayout: fixed left sidebar 240px navy #333545 (logo, links Dashboard, Movies, Theatres, Screens, Shows, Bookings, Users with active item highlighted by a red left border), top bar 56px white with page title, admin name, and a View Site link, content area page-bg with 24px padding. Under 1024px the sidebar becomes a slide-in drawer. All lists use DataTable; all forms use FormField with inline validation and a sticky footer with Cancel and Save buttons.

### Admin Dashboard (/admin)
- Data: `GET /api/admin/stats?days=14`.
- Layout: Row of 4 StatCards (Total revenue in Rs., Confirmed bookings, Tickets sold, Active shows). Line chart 'Revenue and bookings, last 14 days'. Bar chart 'Top 5 movies by revenue'. Table 'Upcoming shows occupancy' (movie, theatre, time, booked/total, percent bar).
- Interactions: Range selector 7 / 14 / 30 days refetches. Charts are simple SVG components (no heavy library) with tooltips on hover and axis labels.
- States: Loading skeleton cards and chart placeholders. Empty chart: 'No bookings in this period'. Error: Retry.
- Edge cases: Zero-revenue days still render points. Long movie names truncate with title tooltip.

### Admin Movies (/admin/movies, /new, /:id/edit)
- Data: `GET /api/admin/movies`, `GET /api/admin/movies/:id`, POST and PUT multipart, DELETE.
- Layout: List: search, status filter, table columns Poster thumbnail, Title, Languages, Status badge, Release date, Duration, Actions (Edit, Delete). Form sections: Basic (title, description, duration, release date, certificate, status), Classification (genres multi-select, languages multi-select, formats checkboxes), Media (poster required, backdrop optional via ImageUpload, trailer URL), Cast (dynamic rows: name, role, image URL, add and remove up to 12).
- Interactions: Submit builds FormData (arrays as JSON strings). Edit pre-fills and keeps existing images unless replaced. Delete uses ConfirmDialog. Unsaved changes prompt when navigating away.
- States: Field-level validation, upload progress indicator, success toast then navigate to list. Server 409 MOVIE_HAS_BOOKINGS shown in a dialog.
- Edge cases: Duplicate titles allowed. Release date in the past with status coming_soon shows a warning. Large files rejected client-side.

### Admin Theatres and Screens (/admin/theatres, /admin/screens)
- Data: `GET/POST/PUT /api/admin/theatres`; `GET/POST/PUT /api/admin/screens?theatre`.
- Layout: Theatres: table (name, city, address, screens count, active toggle) and form (name, city with datalist of existing cities, address, amenities chips). Screens: theatre filter, table (name, theatre, total seats, categories), ScreenForm with theatre select, name, LayoutBuilder.
- Interactions: LayoutBuilder rules enforced live: unique row labels, seatCount 1-30, aisle numbers valid, total seats counter, category list preview; Save disabled while invalid.
- States: Standard loading, empty and error states; duplicate name shows server DUPLICATE message on the name field.
- Edge cases: SCREEN_HAS_BOOKINGS 409 explained in a dialog; layout can be duplicated from another screen via a Copy layout dropdown.

### Admin Shows (/admin/shows, /new, /:id/edit)
- Data: `GET /api/admin/shows`, GET movies and screens for selects, POST, PUT, DELETE (cascade option).
- Layout: List filters: movie, theatre, date; table columns Movie, Theatre and screen, Start, End, Language and format, Pricing summary, Booked/Capacity, Status, Actions. ShowForm: movie select, theatre select then screen select (filtered), date picker and time picker (IST), language and format selects limited to the movie's options, dynamic pricing inputs one per screen category (prefilled 150/250/350 by order), computed End time preview.
- Interactions: On submit server errors surface: SHOW_OVERLAP shows the conflicting show details (movie and time range) in an inline alert; SHOW_IN_PAST on the date field. Delete asks ConfirmDialog; if bookings exist offer 'Cancel show and refund all bookings' (cascade=true) with a typed confirmation.
- States: Standard states. Disabled fields with an explanatory hint when the show already has bookings (time, screen, pricing locked).
- Edge cases: Changing movie recomputes end time preview. Past shows list as completed and read-only.

### Admin Bookings and Users (/admin/bookings, /admin/users)
- Data: `GET /api/admin/bookings` with filters, `GET /api/admin/bookings/:id`, `PATCH` cancel; `GET /api/admin/users`, `PATCH` status.
- Layout: Bookings: filter bar (movie, status, date range, email search) + summary (count and revenue for the filter), table (Booking ref, User, Movie, Show time, Seats, Amount, Status, Actions), row click opens a side drawer with full ticket details, payment id and refund info, Cancel and refund button (ConfirmDialog). Users: search, role filter, table (name, email, role, status, joined), Activate or Deactivate toggle with ConfirmDialog; own row has the toggle disabled.
- Interactions: Filters sync to URL query. Cancel updates the row in place.
- States: Standard states.
- Edge cases: Refund FAILED rows highlighted with a warning badge.

---

## C8. Form validation rules (client side, mirrors backend)
| Form | Fields and rules |
| :--- | :--- |
| Login | email: required, valid format. password: required. |
| Register | name 2-60; email valid; phone optional 10 digits starting 6-9; password 8-64 with upper, lower and digit; confirm password equals password. Inline strength meter (weak, medium, strong). |
| Movie | title 1-120; description 10-2000; duration integer 30-400; release date required; certificate required; at least 1 genre and 1 language; poster required on create; image types jpeg, png, webp <= 5 MB; trailer URL valid http(s) if present; cast name required when a cast row exists. |
| Theatre | name 2-80; city required; address 5-200; amenities max 8. |
| Screen | theatre required; name 1-40; at least 1 row; row label letters unique; seatCount 1-30; category required; aisle numbers integers within 1..seatCount-1; total seats <= 600. |
| Show | movie, screen, date and time required and in the future; language and format required; every category price integer 50-5000. |
| Cancel booking | confirm dialog only; disabled when show is within 2 hours. |

---

## C9. Responsive, accessibility and UX details
- Mobile first. Verify at 360, 768, 1024 and 1280 px. No horizontal page scroll anywhere except intentional scrollers (poster rows, seat grid, date strip).
- Touch targets at least 40px (seats 24px on mobile are spaced 6px; allow pinch zoom, do not disable viewport scaling).
- Every interactive element reachable by keyboard with a visible focus ring (2px red). Modals trap focus, close with Esc, restore focus on close, use role=dialog and aria-modal.
- Images have meaningful alt text; icon-only buttons have aria-label; seats are buttons with aria-label 'Seat A5, Gold, Rs. 250, available' and aria-pressed for selected.
- Colour is never the only status signal: sold seats are also not focusable, time pills carry text labels in tooltips.
- Route changes scroll to top and set document.title (for example 'Midnight Express - Book tickets | ShowTime'); each page sets a sensible title.
- Lazy-load route components with React.lazy and Suspense (Spinner fallback); lazy-load images below the fold.
- Every async action has loading, success and error feedback. Buttons that trigger requests disable while pending to prevent double submits.
- Never store tokens in localStorage. Only the city and the in-progress booking state are stored client side.
- Use the same copy and wording consistently: 'Book tickets', 'Select seats', 'Pay Rs. X', 'My Bookings', 'Sign in'.

---

## C10. Frontend verification checklist
| Area | Checks |
| :--- | :--- |
| Visual parity | Header, nav, city modal, hero, poster rows, movie hero, date strip, time pills, seat map and bottom pay bar compared against the design tokens in C4 |
| Flows | Guest browsing; sign in from modal; redirect back after login; full booking; payment dismissed; payment failed; hold expired; seat conflict; cancel; print ticket |
| Resilience | Backend offline shows ErrorState with Retry on every page; slow network shows skeletons; 401 mid-session opens AuthModal; refresh on every route works (SPA rewrite) |
| Admin | Create a full catalogue through the UI; overlapping show message; cascade cancel; non-admin blocked |
| Quality | No console errors or warnings; ESLint clean; no localhost strings; Lighthouse accessibility score of 90 or higher on Home and Seat Selection |
