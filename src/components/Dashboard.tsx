import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { logout } from "@/server/auth";
import { useAuthStore } from "@/store/auth";
import { useAdminStore } from "@/store/admin";
import {
  Briefcase,
  FolderKanban,
  MessageSquare,
  LogOut,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await doLogout({});
    clear();
  };

  const navContent = (
    <>
      <div className="flex items-center gap-4 border-b border-white/10 px-6 py-6 md:px-8">
        <img src="/blutech-logo.png" alt="BluTech" className="h-10 w-10 object-contain" />
        <div>
          <div className="font-display text-sm uppercase tracking-wide text-white">BluTech</div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-sky-400">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-4 md:p-6">
        <div className="mb-4 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Menu</div>
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                setMobileMenuOpen(false);
              }}
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-sky-500/10 text-sky-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-sky-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className={`h-4 w-4 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 md:p-6">
        <div className="mb-4 rounded-xl bg-black/20 p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Signed In As</div>
          <div className="truncate text-xs font-medium text-slate-300 mt-1">{email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-300 selection:bg-sky-500/30">
      {/* Mobile Topbar */}
      <div className="fixed top-0 z-40 flex w-full items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <img src="/blutech-logo.png" alt="BluTech" className="h-7 w-7 object-contain" />
          <span className="font-display text-sm uppercase text-white">BluTech</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-slate-900 shadow-2xl animate-in slide-in-from-left">
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-[280px] flex-col border-r border-white/10 bg-slate-950/50 lg:flex relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 h-[300px] w-full bg-sky-500/5 blur-[100px] pointer-events-none" />
        <div className="relative flex flex-col h-full z-10">
          {navContent}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0 relative">
        {/* Subtle background pattern/glow for main area */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeSection === "services" && <ServicesPanel />}
          {activeSection === "projects" && <ProjectsPanel />}
          {activeSection === "commissions" && <CommissionsPanel />}
        </div>
      </main>
    </div>
  );
}
