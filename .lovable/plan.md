

## Reports System

### Overview
Complete rewrite of `AdminReportsPage.tsx` with 7 report types, date filtering, and PDF/Excel export. Two new dependencies needed: `jspdf` + `jspdf-autotable` for PDF export and `xlsx` for Excel export.

### New Dependencies
- `jspdf` and `jspdf-autotable` -- Generate PDF reports with tables
- `xlsx` -- Generate Excel (.xlsx) files for download

### Report Types (Tabs)

| Tab | Data Source | Columns |
|-----|------------|---------|
| **Daily Report** | Bookings + payments filtered to a selected date | Date, Tracking ID, Package, Amount, Paid, Due, Status |
| **Monthly Report** | Aggregated by month (selectable month/year) | Month, Total Bookings, Revenue, Expenses, Net Profit |
| **Yearly Report** | Aggregated by year (selectable year) | Year, Total Bookings, Revenue, Expenses, Net Profit |
| **Package-wise Revenue** | Bookings grouped by package name/type | Package Name, Type, Bookings Count, Total Revenue, Expenses, Profit |
| **Hajji-wise Revenue** | Bookings grouped by individual customer (user) | Customer Name, Phone, Bookings, Revenue Collected, Due, Expenses, Profit |
| **Due Report** | Payments where status = 'pending' | Tracking ID, Customer, Installment, Amount, Due Date |
| **Overdue Report** | Pending payments where due_date < today | Tracking ID, Customer, Installment, Amount, Due Date, Days Overdue |

### UI Layout

1. **Top bar**: Title + Export buttons (PDF / Excel)
2. **Tab navigation**: 7 tabs for each report type
3. **Filters row**: Date picker / month-year selector / year selector depending on active tab
4. **Summary cards**: Key totals for the active report (e.g., total revenue, total due)
5. **Data table**: Report data rendered in a table

### Export Logic

**PDF Export** (`jspdf` + `jspdf-autotable`):
- Creates a new PDF document with report title, date range, and a formatted table
- Uses `jspdf-autotable` plugin to render table rows from the active report data
- Triggers browser download

**Excel Export** (`xlsx`):
- Converts active report table data into a worksheet
- Creates a workbook, appends the sheet, and triggers download via `xlsx.writeFile()`

### Data Fetching

Single `useEffect` loads all raw data on mount:
- `bookings` with `packages(name, type)` join
- `payments` with `bookings(tracking_id)` and profiles via `user_id`
- `expenses` (from `expenses` table)
- `profiles` for customer name lookups
- `transactions` where `type = 'expense'` for per-booking/per-customer expense assignment

All report computations are `useMemo`-derived from the raw data + active filters.

### Files Changed

| File | Action |
|------|--------|
| `src/pages/admin/AdminReportsPage.tsx` | Full rewrite |
| `src/lib/reportExport.ts` | New -- PDF and Excel export utility functions |
| `package.json` | Add `jspdf`, `jspdf-autotable`, `xlsx` |

### Technical Notes

- `date-fns` (already installed) used for date filtering/formatting
- All financial values use `Number()` conversion for accuracy
- Export functions receive a generic `{ title, columns, rows }` object so any tab can export
- Currency formatted as `৳` (BDT) consistently
- Overdue calculation: `differenceInDays(new Date(), parseISO(payment.due_date))`
