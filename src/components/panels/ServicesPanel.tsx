import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getServices, createService, updateService, deleteService } from "@/server/services";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Check, X, Code2, Smartphone, Palette, Server, Sparkles, Globe, Zap, Layers } from "lucide-react";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

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

const ICON_OPTIONS = [
  { name: "Code2", icon: Code2 },
  { name: "Smartphone", icon: Smartphone },
  { name: "Palette", icon: Palette },
  { name: "Server", icon: Server },
  { name: "Sparkles", icon: Sparkles },
  { name: "Globe", icon: Globe },
  { name: "Zap", icon: Zap },
  { name: "Layers", icon: Layers },
];

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
      toast.error("Failed to load services");
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight text-white sm:text-3xl">Services</h1>
          <p className="mt-1 text-sm font-medium uppercase tracking-widest text-slate-500">Manage the "What I Do" section</p>
        </div>
        <button
          onClick={openCreate}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span className="relative z-10">Add Service</span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10">
            <Plus className="h-8 w-8 text-sky-500" />
          </div>
          <h3 className="font-display text-xl uppercase tracking-tight text-white">No Services Yet</h3>
          <p className="mt-2 text-sm text-slate-400">Add your first service to showcase your offerings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => {
            const Icon = ICON_OPTIONS.find(i => i.name === s.icon)?.icon || Code2;
            return (
              <div key={s.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-1 hover:border-sky-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-sky-500/10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 text-sky-400 shadow-inner shadow-white/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openEdit(s)} className="rounded-lg bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(s.id)} className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-display text-lg tracking-tight text-white">{s.title}</h3>
                  {!s.is_active && <span className="rounded-full border border-slate-700 bg-slate-800/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Hidden</span>}
                </div>
                
                <p className="mb-4 line-clamp-3 text-sm text-slate-400 flex-1">{s.description}</p>
                
                <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  {s.tags.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-sky-400">
                      {t}
                    </span>
                  ))}
                  {s.tags.length > 3 && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400">
                      +{s.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-300 sm:max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <Dialog.Title className="font-display text-xl uppercase tracking-tight text-white">
                {editing ? "Edit Service" : "New Service"}
              </Dialog.Title>
              <Dialog.Close className="rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Modal Body */}
            <div className="max-h-[calc(90vh-130px)] overflow-y-auto p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Service Title *
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                      placeholder="e.g. Web Development"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Service Icon
                    </label>
                    <div className="grid grid-cols-4 gap-3 pt-1">
                      {ICON_OPTIONS.map(({ name, icon: Icon }) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setForm({ ...form, icon: name })}
                          className={`flex h-12 items-center justify-center rounded-xl border transition-all ${
                            form.icon === name
                              ? "border-sky-500/50 bg-sky-500/20 text-sky-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-sky-500/20 scale-105"
                              : "border-white/10 bg-black/20 text-slate-500 hover:border-white/20 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Technology Tags
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        className="h-12 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                        placeholder="e.g. Next.js (Enter)"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="rounded-xl bg-white/10 px-6 text-sm font-bold text-white transition-all hover:bg-white/20"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.tags.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-sky-400"
                        >
                          {t}
                          <button
                            onClick={() => removeTag(t)}
                            className="text-sky-400/50 transition-colors hover:text-red-400"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Description *
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={5}
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                      placeholder="Describe what you offer in this service..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-6 border-t border-white/10 pt-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="h-12 w-28 rounded-xl border border-white/10 bg-black/20 px-4 text-center text-sm font-bold text-white outline-none transition-all focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                  />
                </div>

                <div className="flex flex-1 items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`flex h-12 flex-1 items-center justify-center gap-3 rounded-xl border transition-all ${
                      form.is_active
                        ? "border-sky-500/50 bg-sky-500/20 text-sky-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-sky-500/20"
                        : "border-white/10 bg-black/20 text-slate-500 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                      form.is_active ? "border-sky-400 bg-sky-400 text-slate-900" : "border-slate-600 bg-black/50"
                    }`}>
                      {form.is_active && <Check className="h-3.5 w-3.5 stroke-[4]" />}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest">Publicly Active</span>
                  </button>
                  <div className="hidden sm:block sm:flex-1" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-white/5 px-6 py-4">
              <Dialog.Close className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-400 transition-colors hover:text-white">
                Cancel
              </Dialog.Close>
              <button
                onClick={onSave}
                disabled={saving}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span className="relative z-10">{editing ? "Save Changes" : "Create Service"}</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
