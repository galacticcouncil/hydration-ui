import create from "zustand"

interface Account {
  name: string
  address: string
}

interface Store {
  account?: Account
  setAccount: (account: Account) => void
}

export const useStore = create<Store>((set) => ({
  setAccount: (account) =>
    set({
      account,
    }),
}))
