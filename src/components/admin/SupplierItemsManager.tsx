import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

const fmt = (n: number) => `৳${Number(n || 0).toLocaleString()}`;

interface SupplierItem {
  id: string;
  supplier_agent_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
}

interface Props {
  supplierId: string;
  items: SupplierItem[];
  isViewer: boolean;
  onRefresh: () => void;
}

const emptyForm = { description: "", quantity: "", unit_price: "" };

export default function SupplierItemsManager({ supplierId, items, isViewer, onRefresh }: Props) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const grandTotal = items.reduce((s, i) => s + Number(i.total_amount || 0), 0);

  const handleSave = async () => {
    if (!form.description.trim()) {
      toast({ title: "বিবরণ দিন", variant: "destructive" });
      return;
    }
    const qty = parseFloat(form.quantity) || 0;
    const price = parseFloat(form.unit_price) || 0;
    if (qty <= 0 || price <= 0) {
      toast({ title: "সংখ্যা ও দর সঠিকভাবে দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      supplier_agent_id: supplierId,
      description: form.description.trim(),
      quantity: qty,
      unit_price: price,
      total_amount: qty * price,
    };

    if (editId) {
      const { error } = await supabase.from("supplier_agent_items").update(payload).eq("id", editId);
      if (error) { toast({ title: "আপডেট ব্যর্থ", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "আইটেম আপডেট হয়েছে" });
    } else {
      const { error } = await supabase.from("supplier_agent_items").insert(payload);
      if (error) { toast({ title: "তৈরি ব্যর্থ", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "আইটেম যোগ হয়েছে" });
    }
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    onRefresh();
  };

  const startEdit = (item: SupplierItem) => {
    setForm({
      description: item.description,
      quantity: String(item.quantity),
      unit_price: String(item.unit_price),
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("supplier_agent_items").delete().eq("id", deleteId);
    if (error) { toast({ title: "মুছতে ব্যর্থ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "আইটেম মুছে ফেলা হয়েছে" });
    setDeleteId(null);
    onRefresh();
  };

  const computedTotal = (parseFloat(form.quantity) || 0) * (parseFloat(form.unit_price) || 0);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> সার্ভিস / আইটেম ({items.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">মোট: {fmt(grandTotal)}</span>
              {!isViewer && (
                <Button size="sm" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> আইটেম যোগ
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">কোনো আইটেম নেই — সার্ভিস/আইটেম যোগ করুন</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10 text-center">SL</TableHead>
                    <TableHead>বিবরণ</TableHead>
                    <TableHead className="text-right">সংখ্যা</TableHead>
                    <TableHead className="text-right">দর (৳)</TableHead>
                    <TableHead className="text-right">মোট (৳)</TableHead>
                    {!isViewer && <TableHead className="text-center w-20">অ্যাকশন</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{fmt(item.unit_price)}</TableCell>
                      <TableCell className="text-right font-bold">{fmt(item.total_amount)}</TableCell>
                      {!isViewer && (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(item)}>
                              <Pencil className="h-3.5 w-3.5 text-amber-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(item.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {/* Grand Total Row */}
                  <TableRow className="bg-muted/60 font-bold">
                    <TableCell colSpan={4} className="text-right">মোট =</TableCell>
                    <TableCell className="text-right text-primary">{fmt(grandTotal)}</TableCell>
                    {!isViewer && <TableCell />}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={o => { if (!o) { setShowForm(false); setEditId(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "আইটেম সম্পাদনা" : "নতুন আইটেম/সার্ভিস যোগ"}</DialogTitle>
            <DialogDescription>সার্ভিস বা আইটেমের তথ্য দিন</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">বিবরণ *</label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="যেমন: উমরাহ ভিসা, টিকেট লোকাল বিমান..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">সংখ্যা *</label>
                <Input type="number" min="0" step="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium">দর (প্রতি ইউনিট) *</label>
                <Input type="number" min="0" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} placeholder="0" />
              </div>
            </div>
            {computedTotal > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">মোট পরিমাণ</p>
                <p className="text-xl font-bold text-primary">{fmt(computedTotal)}</p>
                <p className="text-xs text-muted-foreground">{form.quantity} × {fmt(parseFloat(form.unit_price) || 0)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>বাতিল</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "সেভ হচ্ছে..." : editId ? "আপডেট" : "যোগ করুন"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>আইটেম মুছে ফেলতে চান?</DialogTitle>
            <DialogDescription>এই আইটেমটি স্থায়ীভাবে মুছে ফেলা হবে।</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>বাতিল</Button>
            <Button variant="destructive" onClick={handleDelete}>মুছুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
