import { create } from "zustand"

export type HbrSession = {
  token: string
  /** The session's wallet, lowercase, as the server returned it. */
  h160: string
  expiresAt: string
}

type HbrSessionStore = {
  session: HbrSession | null
  setSession: (session: HbrSession) => void
  clear: () => void
  /** Clears only when `token` is still the live one (a late 401 of an old token keeps a newer session). */
  discardToken: (token: string) => void
}

/**
 * The HBR bearer token lives in memory only: no `persist` middleware, so it is
 * never written to localStorage and a reload signs the user out. Never log it.
 */
export const useHbrSessionStore = create<HbrSessionStore>((set, get) => ({
  session: null,
  setSession: (session) =>
    set({ session: { ...session, h160: session.h160.toLowerCase() } }),
  clear: () => set({ session: null }),
  discardToken: (token) => {
    if (get().session?.token === token) set({ session: null })
  },
}))
