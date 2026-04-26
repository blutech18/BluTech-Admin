import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getCommissions, updateCommission, deleteCommission } from "@/server/commissions";
import { Trash2, Loader2, Mail, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";

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
  pending: "bg-amber-500/10 text-amber-400",
  reviewed: "bg-blue-500/10 text-blue-400",
  accepted: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
  completed: "bg-primary/10 text-primary",
};

const STATUSES = ["pending", "reviewed", "accepted", "rejected", "completed"];

export function CommissionsPanel() {
  const fetchCommissions = useServerFn(getCommissions);
  const doUpdate = useServerFn(updateCommission);
  const doDelete = useServerFn(deleteCommission);

  const [items, setItems] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try { setItems(await fetchCommissions({}) as Commission[]); } catch (err) { console.error("Failed to load commissions:", err); toast.error("Failed to load: " + (err instanceof Error ? err.message : String(err))); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onStatusChange = async (id: string, status: string) => {
    try {
      await doUpdate({ data: { id, status: status as "pending", admin_notes: notes[id] } });
      toast.success("Status updated");
      load();
    } catch { toast.error("Failed"); }
  };

  const onSaveNotes = async (c: Commission) => {
    try {
      await doUpdate({ data: { id: c.id, status: c.status as "pending", admin_notes: notes[c.id] ?? c.admin_notes ?? "" } });
      toast.success("Notes saved");
      load();
    } catch { toast.error("Failed"); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this commission?")) return;
    try { await doDelete({ data: { id } }); toast.success("Deleted"); load(); } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Commissions</h1>
        <p className="text-sm text-muted-foreground">Manage incoming project requests</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-3 h-8 w-8" />
          No commissions yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => {
            const expanded = expandedId === c.id;
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{c.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[c.status] ?? STATUS_COLORS.pending}`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                      <span>{c.project_type}</span>
                      {c.budget && <span>{c.budget}</span>}
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <select
                      value={c.status}
                      onChange={(e) => onStatusChange(c.id, e.target.value)}
                      className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setExpandedId(expanded ? null : c.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-white">
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button onClick={() => onDelete(c.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expanded && (
                  <div className="border-t border-border px-4 py-4">
                    <div className="mb-3">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Message</label>
                      <p className="rounded-xl bg-background p-3 text-sm text-foreground">{c.message}</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Admin Notes</label>
                      <textarea
                        value={notes[c.id] ?? c.admin_notes ?? ""}
                        onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })}
                        rows={2}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                        placeholder="Internal notes..."
                      />
                      <button onClick={() => onSaveNotes(c)} className="mt-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                        Save Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
