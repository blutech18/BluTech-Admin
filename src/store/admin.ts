import { create } from "zustand";

interface AdminState {
  // Active section in sidebar
  activeSection: "services" | "projects" | "commissions";
  setActiveSection: (s: AdminState["activeSection"]) => void;

  // Modal state
  editingId: string | null;
  modalOpen: boolean;
  openModal: (id?: string) => void;
  closeModal: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  activeSection: "services",
  setActiveSection: (activeSection) => set({ activeSection }),
  editingId: null,
  modalOpen: false,
  openModal: (id) => set({ editingId: id ?? null, modalOpen: true }),
  closeModal: () => set({ editingId: null, modalOpen: false }),
}));
