import { useServerFn } from "@tanstack/react-start";
import { logout } from "@/server/auth";
import { useAuthStore } from "@/store/auth";
import { useAdminStore } from "@/store/admin";
import {
  Briefcase,
  FolderKanban,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { ServicesPanel } from "./panels/ServicesPanel";
import { ProjectsPanel } from "./panels/ProjectsPanel";
import { CommissionsPanel } from "./panels/CommissionsPanel";

const NAV_ITEMS = [
  { key: "services" as const, label: "Services", icon: Briefcase },
  { key: "projects" as const, label: "Projects", icon: FolderKanban },
  { key: "commissions" as const, label: "Commissions", icon: MessageSquare },
];

export function Dashboard() {
  const doLogout = useServerFn(logout);
  const { email, clear } = useAuthStore();
  const { activeSection, setActiveSection } = useAdminStore();

  const handleLogout = async () => {
    await doLogout({});
    clear();
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <img src="/blutech-logo.png" alt="BluTech" className="h-9 w-9 object-contain" />
          <div>
            <div className="font-display text-sm uppercase text-white">BluTech</div>
            <div className="text-[10px] text-muted-foreground">Admin Panel</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 truncate px-3 text-xs text-muted-foreground">{email}</div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl p-6 md:p-8">
          {activeSection === "services" && <ServicesPanel />}
          {activeSection === "projects" && <ProjectsPanel />}
          {activeSection === "commissions" && <CommissionsPanel />}
        </div>
      </main>
    </div>
  );
}
