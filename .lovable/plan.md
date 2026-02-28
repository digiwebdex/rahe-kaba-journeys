

## Analysis

This application already has ~95% of the requested features built. Here is what exists and what's missing:

### Already Implemented
- All pages (Home, Packages, Hotels, Booking, Tracking, Dashboard, About, Contact)
- Admin panel with sidebar (Dashboard, Bookings, Customers, Packages, Hotels, Payments, Accounting, Reports, CMS, Settings, Notifications)
- Payment system with installments, auto-calculation, negative-due prevention
- Document upload system (passport, NID, photo)
- Hotel booking module with management
- RBAC (admin, manager, staff, viewer)
- CMS system with version history
- Reports with PDF/Excel export
- Notification system (email + SMS)
- Order tracking by Tracking ID
- Financial reports (customer-wise, package-wise)
- Accounting (income, expenses, profit)

### Gaps to Fix

1. **Booking requires login** — Currently `Booking.tsx` redirects to `/auth` if no session (lines 51-54). The user explicitly wants booking WITHOUT login. This is the biggest change needed.

2. **No phone number search on tracking page** — Currently only supports Tracking ID search. User wants phone number search too.

3. **No Testimonials section** on the home page — User requested it but it doesn't exist.

4. **Passport is required during booking** (line 101-104) — User says passport should be optional.

---

## Implementation Plan

### 1. Enable guest booking (no login required)
- Remove auth redirect from `Booking.tsx`
- Allow guest users to fill in personal details and submit
- For guests: insert a temporary profile or use a service-role edge function to create the booking
- Create an edge function `create-guest-booking` that:
  - Accepts booking details + personal info
  - Creates/finds a guest profile entry
  - Inserts the booking
  - Returns the tracking ID
- Add RLS policy or use service role for guest inserts
- Keep optional login: if user is logged in, pre-fill from profile as before

### 2. Add phone number search to tracking page
- Add a toggle or auto-detect (phone vs tracking ID) in the search bar
- Query bookings joined with profiles where `profiles.phone` matches
- Show multiple results if phone has multiple bookings

### 3. Add Testimonials section to home page
- Create `TestimonialsSection.tsx` component with static testimonials (editable via CMS later)
- Add it to `Index.tsx` between existing sections

### 4. Make passport optional during booking
- Remove the passport validation requirement in `validateStep()`

### Technical Details

**Guest Booking Edge Function** (`supabase/functions/create-guest-booking/index.ts`):
- Accepts: `fullName`, `phone`, `address`, `passportNumber` (optional), `email` (optional), `packageId`, `numTravelers`, `notes`
- Uses service role to bypass RLS
- Creates profile if phone doesn't exist, or links to existing
- Inserts booking with `status: 'pending'`, `paid_amount: 0`
- Returns `tracking_id`

**Database changes needed**:
- Make `bookings.user_id` nullable OR use a system/guest user approach
- Add phone-based lookup support

**Files to create**:
- `src/components/TestimonialsSection.tsx`
- `supabase/functions/create-guest-booking/index.ts`

**Files to modify**:
- `src/pages/Booking.tsx` — Remove auth gate, add guest flow
- `src/pages/TrackBooking.tsx` — Add phone number search
- `src/pages/Index.tsx` — Add TestimonialsSection
- `supabase/config.toml` — Add guest-booking function config

