import { create } from "zustand";

type Section = "services" | "projects" | "commissions";

function getSavedSection(): Section {
  if (typeof window === "undefined") return "services";
  const saved = localStorage.getItem("admin-section");
  if (saved === "services" || saved === "projects" || saved === "commissions") return saved;
  return "services";
}

interface AdminState {
  // Active section in sidebar
  activeSection: Section;
  setActiveSection: (s: Section) => void;

  // Modal state
  editingId: string | null;
  modalOpen: boolean;
  openModal: (id?: string) => void;
  closeModal: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  activeSection: getSavedSection(),
  setActiveSection: (activeSection) => {
    if (typeof window !== "undefined") localStorage.setItem("admin-section", activeSection);
    set({ activeSection });
  },
  editingId: null,
  modalOpen: false,
  openModal: (id) => set({ editingId: id ?? null, modalOpen: true }),
  closeModal: () => set({ editingId: null, modalOpen: false }),
}));
