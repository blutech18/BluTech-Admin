import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMarqueeItems, createMarqueeItem, updateMarqueeItem, deleteMarqueeItem } from "@/server/marquee";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MarqueeItem {
  id: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY = { label: "", sort_order: 0, is_active: true };

export function MarqueePanel() {
  const fetchItems = useServerFn(getMarqueeItems);
  const doCreate = useServerFn(createMarqueeItem);
  const doUpdate = useServerFn(updateMarqueeItem);
  const doDelete = useServerFn(deleteMarqueeItem);

  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MarqueeItem | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await fetchItems({}) as MarqueeItem[]); } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (m: MarqueeItem) => { setEditing(m); setForm({ label: m.label, sort_order: m.sort_order, is_active: m.is_active }); setModalOpen(true); };

  const onSave = async () => {
    if (!form.label) { toast.error("Label required"); return; }
    setSaving(true);
    try {
      if (editing) { await doUpdate({ data: { id: editing.id, ...form } }); toast.success("Updated"); }
      else { await doCreate({ data: form }); toast.success("Created"); }
      setModalOpen(false); load();
    } catch { toast.error("Save failed"); }
    setSaving(false);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    try { await doDelete({ data: { id } }); toast.success("Deleted"); load(); } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marquee</h1>
          <p className="text-sm text-muted-foreground">Manage the scrolling carousel items</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">No marquee items yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-blue-700" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-white">{m.label}</span>
                {!m.is_active && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Hidden</span>}
                <span className="ml-2 text-xs text-muted-foreground">Order: {m.sort_order}</span>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openEdit(m)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => onDelete(m.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-white">{editing ? "Edit" : "New"} Marquee Item</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Label</label>
                <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" placeholder="Web Development" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded" />
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={onSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
