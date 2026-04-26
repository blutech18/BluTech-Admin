import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getServices, createService, updateService, deleteService } from "@/server/services";
import { Plus, Pencil, Trash2, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  tags: string[];
  sort_order: number;
  is_active: boolean;
}

const EMPTY: Omit<Service, "id"> = {
  icon: "Code2",
  title: "",
  description: "",
  tags: [],
  sort_order: 0,
  is_active: true,
};

const ICON_OPTIONS = ["Code2", "Smartphone", "Palette", "Server", "Sparkles", "Globe", "Zap", "Layers"];

export function ServicesPanel() {
  const fetchServices = useServerFn(getServices);
  const doCreate = useServerFn(createService);
  const doUpdate = useServerFn(updateService);
  const doDelete = useServerFn(deleteService);

  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchServices({});
      setItems(data as Service[]);
    } catch (err) {
      console.error("Failed to load services:", err);
      toast.error("Failed to load services: " + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setTagInput("");
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ icon: s.icon, title: s.title, description: s.description, tags: s.tags, sort_order: s.sort_order, is_active: s.is_active });
    setTagInput("");
    setModalOpen(true);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
    }
    setTagInput("");
  };

  const removeTag = (t: string) => setForm({ ...form, tags: form.tags.filter((x) => x !== t) });

  const onSave = async () => {
    if (!form.title || !form.description) { toast.error("Title and description required"); return; }
    setSaving(true);
    try {
      if (editing) {
        await doUpdate({ data: { id: editing.id, ...form } });
        toast.success("Service updated");
      } else {
        await doCreate({ data: form });
        toast.success("Service created");
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error("Save failed");
    }
    setSaving(false);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await doDelete({ data: { id } });
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-sm text-muted-foreground">Manage the "What I Do" section</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No services yet. Add your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                {s.icon.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{s.title}</span>
                  {!s.is_active && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Hidden</span>}
                </div>
                <p className="truncate text-sm text-muted-foreground">{s.description}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.tags.map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openEdit(s)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-white">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(s.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-white">{editing ? "Edit" : "New"} Service</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Icon</label>
                <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary">
                  {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" placeholder="Web Development" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Tags</label>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" placeholder="React" />
                  <button type="button" onClick={addTag} className="rounded-xl bg-primary/10 px-3 text-sm text-primary hover:bg-primary/20">Add</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {form.tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {t} <button onClick={() => removeTag(t)} className="hover:text-destructive">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded" />
                    Active (visible)
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
