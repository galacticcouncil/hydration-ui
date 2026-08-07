import { stringEquals } from "@galacticcouncil/utils"
import { addressToPublicKey, useAccount } from "@galacticcouncil/web3-connect"
import { useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TrackedWallet = {
  publicKey: string
  address: string
  // public keys of the connected accounts that track this address
  savedBy: string[]
}

type TrackedWalletsStore = {
  wallets: TrackedWallet[]
  add: (address: string, savedBy: string) => void
  remove: (publicKey: string, savedBy: string) => void
}

export const useTrackedWalletsStore = create<TrackedWalletsStore>()(
  persist(
    (set) => ({
      wallets: [],
      add: (address, savedBy) =>
        set((state) => {
          const publicKey = addressToPublicKey(address)
          if (!publicKey) return state

          const existing = state.wallets.find((w) =>
            stringEquals(w.publicKey, publicKey),
          )

          if (!existing) {
            return {
              wallets: [
                ...state.wallets,
                { publicKey, address, savedBy: [savedBy] },
              ],
            }
          }

          return {
            wallets: state.wallets.map((w) =>
              w === existing
                ? {
                    ...w,
                    savedBy: w.savedBy.some((key) => stringEquals(key, savedBy))
                      ? w.savedBy
                      : [...w.savedBy, savedBy],
                  }
                : w,
            ),
          }
        }),
      remove: (publicKey, savedBy) =>
        set((state) => ({
          wallets: state.wallets.flatMap((w) => {
            if (!stringEquals(w.publicKey, publicKey)) return [w]

            const nextSavedBy = w.savedBy.filter(
              (key) => !stringEquals(key, savedBy),
            )

            return nextSavedBy.length ? [{ ...w, savedBy: nextSavedBy }] : []
          }),
        })),
    }),
    { name: "tracked-wallets" },
  ),
)

/** add/remove bound to the connected account's public key */
export const useTrackedWalletActions = () => {
  const { account } = useAccount()
  const add = useTrackedWalletsStore((state) => state.add)
  const remove = useTrackedWalletsStore((state) => state.remove)

  return useMemo(() => {
    const accountPublicKey = account ? addressToPublicKey(account.address) : ""

    return {
      add: (address: string) =>
        accountPublicKey && add(address, accountPublicKey),
      remove: (publicKey: string) =>
        accountPublicKey && remove(publicKey, accountPublicKey),
    }
  }, [account, add, remove])
}

export const useTrackedWallets = (): TrackedWallet[] => {
  const { account } = useAccount()
  const wallets = useTrackedWalletsStore((state) => state.wallets)

  return useMemo(() => {
    if (!account) return []

    const accountPublicKey = addressToPublicKey(account.address)

    return wallets.filter(
      (wallet) =>
        !stringEquals(wallet.publicKey, accountPublicKey) &&
        wallet.savedBy.some((key) => stringEquals(key, accountPublicKey)),
    )
  }, [account, wallets])
}
