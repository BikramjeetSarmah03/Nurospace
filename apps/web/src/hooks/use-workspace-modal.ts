import { create } from "zustand";

interface useWorkspaceModalInterface {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useWorkspaceModal = create<useWorkspaceModalInterface>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
