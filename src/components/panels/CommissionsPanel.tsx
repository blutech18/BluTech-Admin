import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getCommissions, updateCommission, deleteCommission } from "@/server/commissions";
import { Trash2, Loader2, Mail, MessageSquare, X, Check, ExternalLink, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

interface Commission {
  id: string;
  name: string;
  email: string;
  project_type: string;
  budget: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
};

const STATUSES = ["pending", "reviewed", "accepted", "rejected", "completed"];

export function CommissionsPanel() {
  const fetchCommissions = useServerFn(getCommissions);
  const doUpdate = useServerFn(updateCommission);
  const doDelete = useServerFn(deleteCommission);

  const [items, setItems] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Modal states
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = (await fetchCommissions({})) as Commission[];
      setItems(data);
    } catch (err) {
      console.error("Failed to load commissions:", err);
      toast.error("Failed to load commissions");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onStatusChange = async (id: string, status: string) => {
    try {
      await doUpdate({ data: { id, status: status as any, admin_notes: notes[id] } });
      toast.success(`Status updated to ${status}`);
      setStatusModalOpen(false);
      load();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const onSaveNotes = async (c: Commission) => {
    try {
      await doUpdate({
        data: { id: c.id, status: c.status as any, admin_notes: notes[c.id] ?? c.admin_notes ?? "" },
      });
      toast.success("Notes saved");
      setDetailsModalOpen(false);
      load();
    } catch {
      toast.error("Failed to save notes");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this commission?")) return;
    try {
      await doDelete({ data: { id } });
      toast.success("Commission deleted");
      load();
    } catch {
      toast.error("Failed to delete commission");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight text-white sm:text-3xl">Commissions</h1>
          <p className="mt-1 text-sm font-medium uppercase tracking-widest text-slate-500">Manage incoming project requests</p>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10">
            <MessageSquare className="h-8 w-8 text-sky-500" />
          </div>
          <h3 className="font-display text-xl uppercase tracking-tight text-white">No Commissions Yet</h3>
          <p className="mt-2 text-sm text-slate-400">When clients request a project, it will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((c) => (
            <div
              key={c.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:-translate-y-0.5 hover:border-sky-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-sky-500/10"
            >
              <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg tracking-tight text-white">{c.name}</span>
                    <div
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                        STATUS_COLORS[c.status] ?? STATUS_COLORS.pending
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {c.status}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="h-3.5 w-3.5" />
                      {c.email}
                    </span>
                    <span className="text-sky-400">{c.project_type}</span>
                    {c.budget && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                        {c.budget}
                      </span>
                    )}
                    <span className="text-slate-500">
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-white/10 pt-4 md:border-0 md:pt-0">
                  <button
                    onClick={() => {
                      setSelectedCommission(c);
                      setStatusModalOpen(true);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-slate-700 md:flex-none"
                  >
                    Status
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCommission(c);
                      setDetailsModalOpen(true);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-sky-400 transition-colors hover:bg-sky-500/20 md:flex-none"
                  >
                    Details
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Selection Modal */}
      <Dialog.Root open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <div>
                <Dialog.Title className="font-display text-lg uppercase tracking-tight text-white">Update Status</Dialog.Title>
                <Dialog.Description className="mt-0.5 text-xs text-slate-400">
                  Select a new status for {selectedCommission?.name}
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <div className="p-6">
              <div className="grid gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => selectedCommission && onStatusChange(selectedCommission.id, s)}
                    className={`flex items-center justify-between rounded-xl border p-4 text-[11px] font-bold uppercase tracking-widest transition-all ${
                      selectedCommission?.status === s
                        ? "border-sky-500/50 bg-sky-500/20 text-sky-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-sky-500/20"
                        : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{s}</span>
                    {selectedCommission?.status === s && (
                      <div className="flex h-5 w-5 items-center justify-center rounded border border-sky-400 bg-sky-400 text-slate-900">
                        <Check className="h-3.5 w-3.5 stroke-[4]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Details Modal */}
      <Dialog.Root open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex max-h-[90vh] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <div>
                <Dialog.Title className="font-display text-xl uppercase tracking-tight text-white">Commission Details</Dialog.Title>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="text-white">{selectedCommission?.name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-sky-400">{selectedCommission?.project_type}</span>
                </div>
              </div>
              <Dialog.Close className="rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 sm:p-8">
              <section>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Message</h3>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {selectedCommission?.message}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Admin Notes</h3>
                <textarea
                  value={
                    selectedCommission
                      ? (notes[selectedCommission.id] ?? selectedCommission.admin_notes ?? "")
                      : ""
                  }
                  onChange={(e) =>
                    selectedCommission &&
                    setNotes({ ...notes, [selectedCommission.id]: e.target.value })
                  }
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Add internal notes about this commission..."
                />
              </section>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-white/5 px-6 py-4">
              <Dialog.Close className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-400 transition-colors hover:text-white">
                Cancel
              </Dialog.Close>
              <button
                onClick={() => selectedCommission && onSaveNotes(selectedCommission)}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] active:scale-[0.98]"
              >
                <span className="relative z-10">Save Notes</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

