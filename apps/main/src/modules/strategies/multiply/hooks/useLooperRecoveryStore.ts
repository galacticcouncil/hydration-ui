import { create } from "zustand"

/**
 * Collateral a two-step entry bought but never opened (step 2 failed or was
 * closed), per pair slug, as a human amount, or "" when step 1 landed but how
 * much it delivered couldn't be read. Kept for the session only.
 */
export const useLooperRecoveryStore = create<{
  held: Record<string, string>
  set: (slug: string, amount: string) => void
  clear: (slug: string) => void
}>((set) => ({
  held: {},
  set: (slug, amount) => set((s) => ({ held: { ...s.held, [slug]: amount } })),
  clear: (slug) =>
    set((s) => {
      const { [slug]: _, ...held } = s.held
      return { held }
    }),
}))
