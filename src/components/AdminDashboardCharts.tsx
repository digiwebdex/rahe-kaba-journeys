import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, DollarSign,
  Users, Wallet, ArrowUpRight, UserCheck,
  CalendarDays, CreditCard, Zap,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useCanSeeProfit } from "@/components/admin/AdminLayout";
import { format } from "date-fns";

interface Props {
  bookings: any[];
  payments: any[];
  expenses?: any[];
  accounts?: any[];
  financialSummary?: any;
  moallemPayments?: any[];
  supplierPayments?: any[];
  commissionPayments?: any[];
  moallems?: any[];
  supplierAgents?: any[];
  supplierContracts?: any[];
  supplierContractPayments?: any[];
  dailyCashbook?: any[];
  onMarkPaid: (id: string) => void;
}

const fmt = (n: number) => `BDT ${n.toLocaleString()}`;

const AdminDashboardCharts = ({
  bookings, payments, expenses = [], accounts = [],
  moallemPayments = [], supplierPayments = [], commissionPayments = [],
  moallems = [], supplierContracts = [], supplierContractPayments = [],
  dailyCashbook = [],
}: Props) => {
  const navigate = useNavigate();
  const canSeeProfit = useCanSeeProfit();
  const [showDueCustomers, setShowDueCustomers] = useState(false);

  const financials = useMemo(() => {
    const activeBookings = bookings.filter(b => b.status !== "cancelled");
    const totalSales = activeBookings.reduce((s, b) => s + Number(b.total_amount || 0), 0);
    const totalHajji = activeBookings.reduce((s, b) => s + Number(b.num_travelers || 0), 0);

    const customerPaymentsIn = payments
      .filter(p => p.status === "completed")
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    const moallemDepositsIn = moallemPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const cashbookIncome = dailyCashbook
      .filter(e => e.type === "income")
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    const totalIncomeReceived = customerPaymentsIn + moallemDepositsIn + cashbookIncome;

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todayIncome = payments
      .filter(p => p.status === "completed" && p.paid_at?.startsWith(todayStr))
      .reduce((s, p) => s + Number(p.amount || 0), 0)
      + moallemPayments.filter(p => p.date?.startsWith(todayStr)).reduce((s, p) => s + Number(p.amount || 0), 0)
      + dailyCashbook.filter(e => e.type === "income" && e.date?.startsWith(todayStr)).reduce((s, e) => s + Number(e.amount || 0), 0);

    const bookingProfit = activeBookings.reduce((s, b) => {
      const selling = Number(b.total_amount || 0);
      const cost = Number(b.total_cost || 0);
      const commission = Number(b.total_commission || 0);
      const extra = Number(b.extra_expense || 0);
      return s + (selling - cost - commission - extra);
    }, 0);
    const generalExpenses = expenses
      .filter(e => !e.booking_id)
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    const netProfit = bookingProfit - generalExpenses;

    const walletAccounts = accounts.filter(a => a.type === "asset");
    const cashBalance = walletAccounts.reduce((s, a) => s + Number(a.balance || 0), 0);

    const customerDue = activeBookings.reduce((s, b) => s + Number(b.due_amount || 0), 0);
    const dueCustomerCount = new Set(
      activeBookings.filter(b => Number(b.due_amount || 0) > 0).map(b => b.guest_phone || b.guest_name || b.tracking_id)
    ).size;

    const todayBookings = bookings.filter(b => b.created_at?.startsWith(todayStr)).length;
    const pendingCount = bookings.filter(b => b.status === "pending").length;
    const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
    const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

    return {
      totalSales, totalHajji, totalIncomeReceived, todayIncome, netProfit, cashBalance,
      customerDue, dueCustomerCount, walletAccounts,
      todayBookings, pendingCount, confirmedCount, cancelledCount,
    };
  }, [bookings, payments, expenses, accounts, moallemPayments, supplierPayments, commissionPayments, supplierContractPayments, supplierContracts, moallems, dailyCashbook]);

  const dueCustomers = useMemo(() => {
    const map: Record<string, { name: string; phone: string; totalDue: number; totalAmount: number; bookingCount: number; bookings: any[] }> = {};
    bookings.filter(b => b.status !== "cancelled" && Number(b.due_amount || 0) > 0).forEach(b => {
      const key = b.guest_phone || b.guest_name || b.tracking_id;
      if (!map[key]) {
        map[key] = { name: b.guest_name || "N/A", phone: b.guest_phone || "", totalDue: 0, totalAmount: 0, bookingCount: 0, bookings: [] };
      }
      map[key].totalDue += Number(b.due_amount || 0);
      map[key].totalAmount += Number(b.total_amount || 0);
      map[key].bookingCount += 1;
      map[key].bookings.push(b);
    });
    return Object.values(map).sort((a, b) => b.totalDue - a.totalDue);
  }, [bookings]);

  const recentBookings = bookings.slice(0, 5);
  const recentPayments = payments.filter(p => p.status === "completed").slice(0, 5);

  // Wallet data
  const walletAccounts = financials.walletAccounts;
  const walletTotal = walletAccounts.reduce((s, a) => s + Number(a.balance || 0), 0);
  const walletColors: Record<string, string> = {
    cash: "bg-emerald-500", bank: "bg-blue-500", bkash: "bg-pink-500", nagad: "bg-orange-500",
  };
  const walletDots: Record<string, string> = {
    cash: "bg-emerald-500", bank: "bg-blue-500", bkash: "bg-pink-500", nagad: "bg-orange-500",
  };

  return (
    <div className="space-y-5">
      {/* ═══ TOP KPI CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Sales */}
        <div
          className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate("/admin/bookings")}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Sales</p>
          </div>
          <p className="text-xl font-bold text-primary tabular-nums">{fmt(financials.totalSales)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{bookings.filter(b => b.status !== "cancelled").length} bookings</p>
        </div>

        {/* Income Received */}
        <div
          className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate("/admin/payments")}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Income Received</p>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">{fmt(financials.totalIncomeReceived)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Today: {fmt(financials.todayIncome)}</p>
        </div>

        {/* Net Profit */}
        <div
          className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate("/admin/accounting")}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-foreground" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Net Profit</p>
          </div>
          <p className={`text-xl font-bold tabular-nums ${financials.netProfit >= 0 ? "text-foreground" : "text-destructive"}`}>
            {fmt(financials.netProfit)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">After all expenses</p>
        </div>

        {/* Customer Due */}
        <div
          className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setShowDueCustomers(true)}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Customer Due</p>
          </div>
          <p className={`text-xl font-bold tabular-nums ${financials.customerDue > 0 ? "text-destructive" : "text-emerald-500"}`}>
            {fmt(financials.customerDue)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{financials.dueCustomerCount} customers</p>
        </div>
      </div>

      {/* ═══ WALLET OVERVIEW + QUICK STATS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Wallet Overview - 3 cols */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" /> Wallet Overview
            </h3>
            <span className={`text-lg font-bold tabular-nums ${walletTotal >= 0 ? "text-primary" : "text-destructive"}`}>
              {fmt(walletTotal)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {["cash", "bank", "bkash", "nagad"].map(name => {
              const acc = walletAccounts.find(a => a.name.toLowerCase().includes(name));
              const bal = acc ? Number(acc.balance || 0) : 0;
              return (
                <div key={name} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${walletDots[name] || "bg-muted"}`} />
                  <div>
                    <p className="text-xs text-muted-foreground capitalize">{name === "bkash" ? "bKash" : name.charAt(0).toUpperCase() + name.slice(1)}</p>
                    <p className="text-sm font-bold tabular-nums">{fmt(bal)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden flex">
            {walletTotal > 0 && ["cash", "bank", "bkash", "nagad"].map(name => {
              const acc = walletAccounts.find(a => a.name.toLowerCase().includes(name));
              const bal = acc ? Number(acc.balance || 0) : 0;
              const pct = walletTotal > 0 ? (bal / walletTotal) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={name}
                  className={`h-full ${walletColors[name] || "bg-muted"}`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Quick Stats - 1 col */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-yellow-500" /> Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Hajji</span>
              <span className="text-sm font-bold text-primary">{financials.totalHajji}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Today's Bookings</span>
              <span className="text-sm font-bold text-primary">{financials.todayBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="text-sm font-bold text-yellow-500">{financials.pendingCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confirmed</span>
              <span className="text-sm font-bold text-foreground">{financials.confirmedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cancelled</span>
              <span className="text-sm font-bold text-destructive">{financials.cancelledCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RECENT BOOKINGS & PAYMENTS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Bookings */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Recent Bookings
            </h3>
            <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => navigate("/admin/bookings")}>View All →</span>
          </div>
          {recentBookings.length > 0 ? (
            <div className="space-y-1">
              {recentBookings.map(b => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0 cursor-pointer hover:bg-secondary/20 rounded px-2 -mx-1 transition-colors"
                  onClick={() => navigate("/admin/bookings")}
                >
                  <div>
                    <p className="text-sm font-semibold">{b.guest_name || "N/A"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {b.tracking_id} · {b.packages?.name || ""} {b.packages?.type ? b.packages.type.toUpperCase() : ""}{" "}
                      {b.created_at ? format(new Date(b.created_at), "dd-MM-yy") : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{fmt(Number(b.total_amount || 0))}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500" :
                      b.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                      "bg-yellow-500/10 text-yellow-600"
                    }`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No bookings yet</p>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-500" /> Recent Payments
            </h3>
            <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => navigate("/admin/payments")}>View All →</span>
          </div>
          {recentPayments.length > 0 ? (
            <div className="space-y-1">
              {recentPayments.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0 cursor-pointer hover:bg-secondary/20 rounded px-2 -mx-1 transition-colors"
                  onClick={() => navigate("/admin/payments")}
                >
                  <div>
                    <p className="text-sm font-semibold">{p.bookings?.tracking_id || p.id.slice(0, 8)}</p>
                    <p className="text-[11px] text-muted-foreground">#{p.installment_number || 1} · {p.payment_method || "cash"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{fmt(Number(p.amount || 0))}</p>
                    <p className="text-[10px] text-muted-foreground">{p.paid_at ? format(new Date(p.paid_at), "dd MMM yy") : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
          )}
        </div>
      </div>

      {/* ═══ DUE CUSTOMERS DIALOG ═══ */}
      <Dialog open={showDueCustomers} onOpenChange={setShowDueCustomers}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Due Customer List
              <span className="text-sm font-normal text-muted-foreground ml-2">({dueCustomers.length} customers)</span>
            </DialogTitle>
          </DialogHeader>
          {dueCustomers.length > 0 ? (
            <div className="space-y-2 mt-2">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm font-medium">Total Due</span>
                <span className="text-lg font-bold text-destructive">{fmt(financials.customerDue)}</span>
              </div>
              {dueCustomers.map((c, i) => (
                <div key={i} className="bg-secondary/30 border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-destructive">{fmt(c.totalDue)}</p>
                      <p className="text-[10px] text-muted-foreground">{c.bookingCount} bookings</p>
                    </div>
                  </div>
                  <div className="space-y-1 mt-2 border-t border-border pt-2">
                    {c.bookings.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{b.tracking_id} · {b.packages?.name || ""}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">Total: {fmt(Number(b.total_amount))}</span>
                          <span className="font-semibold text-destructive">Due: {fmt(Number(b.due_amount))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No dues 🎉</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardCharts;
