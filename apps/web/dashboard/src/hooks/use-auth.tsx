import type { IUser } from "@/config/types";
import { create } from "zustand";

type AuthState = {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
