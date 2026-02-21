

## Update Booking Tracking Statuses

### Current State
The booking tracking system is fully implemented at `/track` with a visual timeline, search by tracking ID, search history, and user bookings display. The current statuses are:
- Pending -> Visa Processing -> Ticket Confirmed -> Completed

### What Changes
Add "Confirmed" step and rename "Ticket Confirmed" to "Ticket Issued" so the flow becomes:
- Pending -> Confirmed -> Visa Processing -> Ticket Issued -> Completed

### Implementation

#### 1. Update `src/pages/TrackBooking.tsx`
- Add a new step `{ key: "confirmed", label: "Confirmed", icon: CheckCircle2 }` between Pending and Visa Processing
- Rename `ticket_confirmed` to `ticket_issued` (label: "Ticket Issued")
- Import an additional icon (e.g., `ShieldCheck`) for Confirmed to differentiate from Completed's `CheckCircle2`

#### 2. Database: Update existing bookings (if any)
- Rename any bookings with `status = 'ticket_confirmed'` to `ticket_issued`:
  ```sql
  UPDATE bookings SET status = 'ticket_issued' WHERE status = 'ticket_confirmed';
  ```

#### 3. Update all other files referencing the old statuses
- `src/pages/admin/AdminDueAlertsPage.tsx` -- status color/label helpers
- `src/pages/admin/AdminBookingsPage.tsx` -- status badge colors
- `src/pages/admin/AdminDashboardPage.tsx` -- any status references
- `src/components/admin/AdminSidebar.tsx` -- if status filters exist

### Files Changed

| File | Change |
|------|--------|
| `src/pages/TrackBooking.tsx` | Add "Confirmed" step, rename "Ticket Confirmed" to "Ticket Issued" |
| `src/pages/admin/AdminDueAlertsPage.tsx` | Update status helpers for new values |
| Database (data update) | Rename `ticket_confirmed` to `ticket_issued` in existing rows |

### Technical Notes
- The `bookings.status` column is a plain `text` field (no enum constraint), so adding new status values requires no schema migration
- The tracking timeline dynamically renders based on `STATUS_STEPS`, so adding one entry is all that's needed for the visual update
- All status comparisons across the app will be updated to recognize `confirmed` and `ticket_issued`
