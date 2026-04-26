import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getProjects, createProject, updateProject, deleteProject } from "@/server/projects";
import { Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  about: string;
  stack: string[];
  gradient: string;
  meta: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

const EMPTY: Omit<Project, "id"> = {
  title: "", category: "", year: new Date().getFullYear().toString(), description: "", about: "",
  stack: [], gradient: "from-sky-400 to-blue-600", meta: "", is_featured: false, is_active: true, sort_order: 0,
};

const GRADIENT_OPTIONS = [
  "from-sky-400 to-blue-600", "from-blue-600 to-indigo-700", "from-cyan-400 to-sky-600",
  "from-indigo-400 to-blue-600", "from-emerald-400 to-cyan-600", "from-violet-400 to-purple-600",
  "from-rose-400 to-pink-600", "from-amber-400 to-orange-600",
];

export function ProjectsPanel() {
  const fetchProjects = useServerFn(getProjects);
  const doCreate = useServerFn(createProject);
  const doUpdate = useServerFn(updateProject);
  const doDelete = useServerFn(deleteProject);

  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [stackInput, setStackInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await fetchProjects({}) as Project[]); } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setStackInput(""); setModalOpen(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ title: p.title, category: p.category, year: p.year, description: p.description, about: p.about, stack: p.stack, gradient: p.gradient, meta: p.meta, is_featured: p.is_featured, is_active: p.is_active, sort_order: p.sort_order });
    setStackInput("");
    setModalOpen(true);
  };

  const addStack = () => {
    const t = stackInput.trim();
    if (t && !form.stack.includes(t)) setForm({ ...form, stack: [...form.stack, t] });
    setStackInput("");
  };

  const onSave = async () => {
    if (!form.title || !form.category || !form.description) { toast.error("Fill required fields"); return; }
    setSaving(true);
    try {
      if (editing) { await doUpdate({ data: { id: editing.id, ...form } }); toast.success("Updated"); }
      else { await doCreate({ data: form }); toast.success("Created"); }
      setModalOpen(false); load();
    } catch { toast.error("Save failed"); }
    setSaving(false);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try { await doDelete({ data: { id } }); toast.success("Deleted"); load(); } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage Showcase (featured) & Complete Portfolio</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">No projects yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <div className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${p.gradient}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{p.title}</span>
                  {p.is_featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                  {!p.is_active && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Hidden</span>}
                </div>
                <p className="text-xs text-muted-foreground">{p.category} · {p.year}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.stack.map((t) => <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{t}</span>)}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => onDelete(p.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-white">{editing ? "Edit" : "New"} Project</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Title *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Category *</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" placeholder="Web Application" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Year</label>
                  <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Meta (e.g. "Web · 2024")</label>
                  <input value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Short Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">About (detailed)</label>
                <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={3} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Gradient</label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENT_OPTIONS.map((g) => (
                    <button key={g} onClick={() => setForm({ ...form, gradient: g })} className={`h-8 w-8 rounded-lg bg-gradient-to-br ${g} ring-2 ${form.gradient === g ? "ring-primary" : "ring-transparent"}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Tech Stack</label>
                <div className="flex gap-2">
                  <input value={stackInput} onChange={(e) => setStackInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStack())} className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" placeholder="React 19" />
                  <button type="button" onClick={addStack} className="rounded-xl bg-primary/10 px-3 text-sm text-primary hover:bg-primary/20">Add</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {form.stack.map((t) => (
                    <span key={t} className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {t} <button onClick={() => setForm({ ...form, stack: form.stack.filter((x) => x !== t) })} className="hover:text-destructive">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Sort</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <label className="flex items-end gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4 rounded" />
                  Featured
                </label>
                <label className="flex items-end gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded" />
                  Active
                </label>
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
