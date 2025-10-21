"use client";

import { UserModel } from "@/model/user/user";
import { create } from "zustand";

type UserState = {
  user: UserModel | null;
  setUser: (user: UserModel) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
