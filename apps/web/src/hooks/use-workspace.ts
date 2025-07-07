// src/store/useWorkspaceStore.ts
import { create } from "zustand";
import { LOCALSTORAGE_KEYS } from "@/config/constants";

type Workspace = {
  id: string;
  name: string;
};

type WorkspaceStore = {
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string) => void;
  deleteWorkspace: () => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeWorkspaceId: localStorage.getItem(LOCALSTORAGE_KEYS.WORKSPACE) || null,

  workspaces: [],

  setActiveWorkspace: (id) => {
    localStorage.setItem(LOCALSTORAGE_KEYS.WORKSPACE, id);
    set({ activeWorkspaceId: id });
  },

  deleteWorkspace: () => {
    localStorage.removeItem(LOCALSTORAGE_KEYS.WORKSPACE);
    set({ activeWorkspaceId: null });
  },

  setWorkspaces: (workspaces) => {
    set({ workspaces });
  },

  addWorkspace: (workspace) => {
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
      activeWorkspaceId: workspace.id,
    }));
    localStorage.setItem(LOCALSTORAGE_KEYS.WORKSPACE, workspace.id);
  },
}));
