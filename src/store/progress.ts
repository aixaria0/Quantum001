import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LABS } from "@/lib/labs";

type ProgressState = {
  seen: Record<string, boolean>;
  mark: (id: string) => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      seen: {},
      mark: (id) => set((s) => ({ seen: { ...s.seen, [id]: true } })),
    }),
    { name: "aether-progress" },
  ),
);

export function completionCount(seen: Record<string, boolean>) {
  return LABS.filter((l) => seen[l.id]).length;
}
