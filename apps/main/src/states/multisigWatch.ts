import { create } from "zustand"

export type MultisigWatch = {
  toastId: string
  multisigAddress: string
  callHash: string
  startedAt: number
}

type MultisigWatchStore = {
  watches: MultisigWatch[]
  addWatch: (watch: MultisigWatch) => void
  removeWatch: (toastId: string) => void
}

export const useMultisigWatchStore = create<MultisigWatchStore>((set) => ({
  watches: [],
  addWatch: (watch) =>
    set((s) => ({
      watches: [...s.watches.filter((w) => w.toastId !== watch.toastId), watch],
    })),
  removeWatch: (toastId) =>
    set((s) => ({ watches: s.watches.filter((w) => w.toastId !== toastId) })),
}))
