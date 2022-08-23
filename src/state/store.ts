import create from "zustand"

interface Store {
  account?: string
  setAccount: (account: string) => void
}

export const useStore = create<Store>((set) => ({
  setAccount: (account) =>
    set({
      account,
    }),
}))
