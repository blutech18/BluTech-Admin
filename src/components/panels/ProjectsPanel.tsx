import { useEffect, useState, useRef, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getProjects, createProject, updateProject, deleteProject } from "@/server/projects";
import { Plus, Pencil, Trash2, Loader2, Star, X, Check, Image as ImageIcon, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import html2canvas from "html2canvas-pro";

interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  about: string;
  stack: string[];
  gradient: string;
  image_url: string | null;
  meta: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  proof_image_url: string | null;
  client_number: string;
  service_type: string;
  transaction_date: string;
}

const EMPTY: Omit<Project, "id"> = {
  title: "",
  category: "",
  year: new Date().getFullYear().toString(),
  description: "",
  about: "",
  stack: [],
  gradient: "from-sky-400 to-blue-600",
  image_url: null,
  meta: "",
  is_featured: false,
  is_active: true,
  sort_order: 0,
  proof_image_url: null,
  client_number: "",
  service_type: "",
  transaction_date: "",
};

const GRADIENT_OPTIONS = [
  "from-sky-400 to-blue-600",
  "from-blue-600 to-indigo-700",
  "from-cyan-400 to-sky-600",
  "from-indigo-400 to-blue-600",
  "from-emerald-400 to-cyan-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-600",
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proofFileInputRef = useRef<HTMLInputElement>(null);
  const proofPreviewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems((await fetchProjects({})) as Project[]);
    } catch (err) {
      console.error("Failed to load projects:", err);
      toast.error("Failed to load projects");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setStackInput("");
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title,
      category: p.category,
      year: p.year,
      description: p.description,
      about: p.about,
      stack: p.stack,
      gradient: p.gradient,
      image_url: p.image_url,
      meta: p.meta,
      is_featured: p.is_featured,
      is_active: p.is_active,
      sort_order: p.sort_order,
      proof_image_url: p.proof_image_url,
      client_number: p.client_number,
      service_type: p.service_type,
      transaction_date: p.transaction_date,
    });
    setStackInput("");
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, image_url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Proof image too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, proof_image_url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const addStack = () => {
    const t = stackInput.trim();
    if (t && !form.stack.includes(t)) setForm({ ...form, stack: [...form.stack, t] });
    setStackInput("");
  };

  const formatProofDate = (raw: string): string => {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
  };

  const downloadProofPng = useCallback(async () => {
    if (!proofPreviewRef.current) return;
    setDownloading(true);
    try {
      // Temporarily make the hidden preview visible for capture
      const el = proofPreviewRef.current;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      el.style.top = "0";
      el.style.display = "block";
      el.style.zIndex = "-1";

      // Wait for images to load
      const imgs = el.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
      );

      const canvas = await html2canvas(el, {
        backgroundColor: "#070b1a",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      el.style.display = "none";

      const link = document.createElement("a");
      link.download = `proof-${form.client_number || "transaction"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Proof image downloaded");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to download proof image");
    }
    setDownloading(false);
  }, [form]);

  const onSave = async () => {
    if (!form.title || !form.category || !form.description) {
      toast.error("Fill required fields");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await doUpdate({ data: { id: editing.id, ...form } });
        toast.success("Project updated");
      } else {
        await doCreate({ data: form });
        toast.success("Project created");
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error("Save failed");
    }
    setSaving(false);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await doDelete({ data: { id } });
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight text-white sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm font-medium uppercase tracking-widest text-slate-500">Manage your portfolio items</p>
        </div>
        <button
          onClick={openCreate}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span className="relative z-10">Add Project</span>
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
          <h3 className="font-display text-xl uppercase tracking-tight text-white">No Projects Yet</h3>
          <p className="mt-2 text-sm text-slate-400">Add your first project to your portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-1 hover:border-sky-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-sky-500/10"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-800 shadow-inner">
                  {p.image_url ? (
                    <img src={p.image_url} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                  ) : (
                    <div className={`h-full w-full bg-gradient-to-br ${p.gradient} transition-transform duration-500 group-hover:scale-110`} />
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-lg bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg tracking-tight text-white">{p.title}</h3>
                  {p.is_featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                  {p.proof_image_url && (
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      Proof
                    </span>
                  )}
                  {!p.is_active && (
                    <span className="rounded-full border border-slate-700 bg-slate-800/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-sky-400">
                  {p.category} · {p.year}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {p.stack.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-sky-400"
                    >
                      {t}
                    </span>
                  ))}
                  {p.stack.length > 3 && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400">
                      +{p.stack.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex h-full max-h-[95vh] w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <Dialog.Title className="font-display text-xl uppercase tracking-tight text-white">
                {editing ? "Edit Project" : "New Project"}
              </Dialog.Title>
              <Dialog.Close className="rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="space-y-8">
                {/* Image Upload Area */}
                <section>
                  <label className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Project Thumbnail
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex aspect-[21/9] w-full cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-white/10 bg-black/20 transition-all hover:border-sky-500/50 hover:bg-sky-500/5"
                  >
                    {form.image_url ? (
                      <>
                        <img src={form.image_url} className="h-full w-full object-cover" alt="" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-xl">
                            <Upload className="h-4 w-4" /> Change Image
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-slate-500 transition-colors group-hover:text-sky-400">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 group-hover:bg-sky-500/20">
                          <Upload className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold">Click to upload project image</p>
                          <p className="mt-1 text-xs">Recommend: 1920x1080 (Max 2MB)</p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </section>

                <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-2">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Title *
                      </label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                        placeholder="e.g. BluTech Dashboard"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Category *
                        </label>
                        <input
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                          placeholder="Web App"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Year
                        </label>
                        <input
                          value={form.year}
                          onChange={(e) => setForm({ ...form, year: e.target.value })}
                          className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Meta String
                      </label>
                      <input
                        value={form.meta}
                        onChange={(e) => setForm({ ...form, meta: e.target.value })}
                        className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                        placeholder="Web · 2024"
                      />
                    </div>

                    <div className="space-y-5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Fallback Gradient
                      </label>
                      <div className="flex flex-wrap gap-3 pt-2">
                        {GRADIENT_OPTIONS.map((g) => (
                          <button
                            key={g}
                            onClick={() => setForm({ ...form, gradient: g })}
                            className={`h-10 w-10 rounded-full bg-gradient-to-br ${g} ring-offset-2 ring-offset-slate-900 transition-all ${
                              form.gradient === g ? "ring-2 ring-sky-400 scale-110 shadow-lg shadow-sky-500/20" : "hover:scale-110 opacity-50 hover:opacity-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Short Description *
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={2}
                        className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                        placeholder="One-sentence hook..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        About (Detailed)
                      </label>
                      <textarea
                        value={form.about}
                        onChange={(e) => setForm({ ...form, about: e.target.value })}
                        rows={6}
                        className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                        placeholder="Describe the project story, challenges, and results..."
                      />
                    </div>
                  </div>
                </div>

                {/* Proof of Transaction Section */}
                <section className="border-t border-white/10 pt-8">
                  <label className="mb-4 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    📋 Proof of Transaction
                  </label>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Proof Image Upload */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Screenshot / Receipt
                      </label>
                      <div
                        onClick={() => proofFileInputRef.current?.click()}
                        className="group relative flex aspect-[3/4] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-black/20 transition-all hover:border-sky-500/50 hover:bg-sky-500/5"
                      >
                        {form.proof_image_url ? (
                          <>
                            <img src={form.proof_image_url} className="h-full w-full object-contain" alt="Proof" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900">
                                <Upload className="h-4 w-4" /> Change Proof
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm({ ...form, proof_image_url: null });
                              }}
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-slate-500 transition-colors group-hover:text-sky-400">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 group-hover:bg-sky-500/20">
                              <ImageIcon className="h-7 w-7" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold">Upload proof screenshot</p>
                              <p className="mt-1 text-xs">Max 5MB · PNG, JPG</p>
                            </div>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={proofFileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleProofFileChange}
                        />
                      </div>
                    </div>

                    {/* Proof Details */}
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Client #
                        </label>
                        <input
                          value={form.client_number}
                          onChange={(e) => setForm({ ...form, client_number: e.target.value })}
                          className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                          placeholder="e.g. 32"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Service Type
                        </label>
                        <input
                          value={form.service_type}
                          onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                          className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                          placeholder="e.g. Python Web Development"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Transaction Date
                        </label>
                        <input
                          type="date"
                          value={form.transaction_date}
                          onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                          className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                        />
                      </div>
                      {form.proof_image_url && (
                        <>
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                              <Check className="h-3.5 w-3.5" /> Visible on user site
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={downloadProofPng}
                            disabled={downloading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-400 transition-all hover:bg-sky-500/20 active:scale-[0.98] disabled:opacity-50"
                          >
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            {downloading ? "Generating..." : "Download Proof as PNG"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </section>

                <div className="space-y-1.5 border-t border-white/10 pt-8">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Tech Stack
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={stackInput}
                      onChange={(e) => setStackInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStack())}
                      className="h-12 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                      placeholder="e.g. Next.js (Press Enter)"
                    />
                    <button
                      type="button"
                      onClick={addStack}
                      className="rounded-xl bg-white/10 px-6 text-sm font-bold text-white transition-all hover:bg-white/20"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.stack.map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-[11px] font-bold tracking-wider text-sky-400"
                      >
                        {t}
                        <button
                          onClick={() => setForm({ ...form, stack: form.stack.filter((x) => x !== t) })}
                          className="text-sky-400/50 hover:text-red-400 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-6 border-t border-white/10 pt-8 pb-4">
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
                      onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                      className={`flex h-12 flex-1 items-center justify-center gap-3 rounded-xl border transition-all ${
                        form.is_featured
                          ? "border-amber-500/50 bg-amber-500/20 text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-amber-500/20"
                          : "border-white/10 bg-black/20 text-slate-500 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                        form.is_featured ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-black/50"
                      }`}>
                        {form.is_featured && <Check className="h-3.5 w-3.5 stroke-[4]" />}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest">Featured Project</span>
                    </button>

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
                  </div>
                </div>
              </div>
            </div>

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
                <span className="relative z-10">{editing ? "Save Changes" : "Create Project"}</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Hidden proof preview for PNG export — matches user-site design exactly */}
      <div
        ref={proofPreviewRef}
        style={{ display: "none", width: 460, fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        <div style={{ background: "#070b1a", padding: "32px 32px 40px", textAlign: "center" }}>
          {/* Text Logo */}
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
            <img src="/text-logo.png" alt="BluTech" style={{ height: 48, objectFit: "contain" }} crossOrigin="anonymous" />
          </div>

          {/* Proof Image with watermark */}
          <div
            style={{
              position: "relative",
              width: 320,
              height: 380,
              margin: "0 auto 24px",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            {form.proof_image_url && (
              <img
                src={form.proof_image_url}
                alt="Proof"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                crossOrigin="anonymous"
              />
            )}
            {/* Watermark */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <img
                src="/blutech-logo.png"
                alt=""
                style={{ width: 192, height: 192, objectFit: "contain", opacity: 0.15 }}
                crossOrigin="anonymous"
              />
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "75%",
              height: 1,
              margin: "0 auto 24px",
              background: "linear-gradient(to right, transparent, rgba(56,189,248,0.4), transparent)",
            }}
          />

          {/* Client # and Date side by side */}
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginBottom: 20 }}>
            {form.client_number && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                  Client#
                </p>
                <p style={{ fontSize: 24, fontWeight: 900, color: "#38bdf8", margin: "4px 0 0" }}>
                  {form.client_number}
                </p>
              </div>
            )}
            {form.transaction_date && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                  Date
                </p>
                <p style={{ fontSize: 24, fontWeight: 900, color: "#38bdf8", margin: "4px 0 0" }}>
                  {formatProofDate(form.transaction_date)}
                </p>
              </div>
            )}
          </div>

          {/* Service Type */}
          {form.service_type && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                Service Type
              </p>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  background: "linear-gradient(to right, #38bdf8, #60a5fa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: "4px 0 0",
                }}
              >
                {form.service_type}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


