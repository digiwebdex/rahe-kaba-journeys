

## Analysis

Currently, "মোট প্রাপ্ত" and "মোট বকেয়া" are calculated from **booking-level** data (`paid_by_moallem`, `moallem_due`). The user wants these to be based on the **contracted_amount** instead:

- **মোট বকেয়া** = `contracted_amount` - total payments received from moallem
- **মোট প্রাপ্ত** = total payments received from moallem (sum of `moallem_payments`)

As the moallem pays installments, বকেয়া decreases and প্রাপ্ত increases.

## Plan

### 1. Update AdminMoallemsPage.tsx (list page)

Change the stats calculation logic:
- Instead of using `bookings.paid_by_moallem` and `bookings.moallem_due`, compute:
  - `received` = `moallem.total_deposit` (already maintained by DB trigger from moallem_payments)
  - `due` = `moallem.contracted_amount - moallem.total_deposit`
- Update KPI summary cards and table columns to use this new formula
- No need to fetch bookings for these stats anymore; the moallems table already has `total_deposit`

### 2. Update AdminMoallemProfilePage.tsx (profile page)

Change KPI computation:
- `totalPaid` = sum of moallem_payments (already correct)
- `totalMoallemDue` = `moallem.contracted_amount - totalPaid` (instead of sum of `bookings.moallem_due`)
- Keep `totalSelling` as `contracted_amount` (the contract value, not booking totals)

### 3. Update Reports page (moallem tab)

Ensure the moallem report rows use `contracted_amount` as the base for due/received calculations.

### Technical Details

**Files to modify:**
- `src/pages/admin/AdminMoallemsPage.tsx` — Change `moallemStats` to use `contracted_amount - total_deposit` for due, `total_deposit` for received directly from moallems table
- `src/pages/admin/AdminMoallemProfilePage.tsx` — Change `totalMoallemDue` to `contracted_amount - totalPaid`, change `totalSelling` to `contracted_amount`
- `src/pages/admin/AdminReportsPage.tsx` — Update moallem report rows if they use booking-level stats

No database changes needed — `moallems.total_deposit` and `moallems.contracted_amount` columns already exist and are maintained by triggers.

