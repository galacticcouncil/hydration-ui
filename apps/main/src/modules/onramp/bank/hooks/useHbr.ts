import { useAccount } from "@galacticcouncil/web3-connect"
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useCallback, useEffect, useLayoutEffect, useMemo } from "react"

import { ENV } from "@/config/env"
import {
  hbrBankAccountsQuery,
  hbrBindWalletMutation,
  hbrBuildRampMutation,
  hbrCreateBankAccountMutation,
  hbrCreateCustomerMutation,
  hbrDepositsQuery,
  hbrMeQuery,
  hbrOnboardingQuery,
  hbrOnrampAccountsQuery,
  hbrPendingFilter,
  hbrQuoteRampMutation,
  hbrRampQuery,
  hbrRampsQuery,
  hbrRemoveBankAccountMutation,
  hbrRequestOnrampAccountMutation,
  hbrRetryOnrampAccountMutation,
  hbrSignInMutation,
  hbrSignOutMutation,
  MessageSigner,
} from "@/modules/onramp/bank/hooks/hbrQueries"
import {
  hbrSessionAccess,
  liveSessionFor,
  readStoredSession,
  useHbrSessionStore,
} from "@/modules/onramp/bank/store/useHbrSessionStore"
import type { PreparedCashOut } from "@/modules/onramp/bank/utils/cashOut"
import { createHbrService } from "@/modules/onramp/bank/utils/createHbrService"
import type { HbrService } from "@/modules/onramp/bank/utils/hbrService"
import { hbrQueryKeys } from "@/modules/onramp/bank/utils/queryKeys"

export type { MessageSigner } from "@/modules/onramp/bank/hooks/hbrQueries"

/** Which page opened the bank flow: deposit (on-ramp) or withdraw (cash-out). */
export type BankDirection = "deposit" | "withdraw"

const hbrService = createHbrService({
  baseUrl: ENV.VITE_HBR_API_URL,
  session: hbrSessionAccess,
})

export const useHbrService = (): HbrService => hbrService

/** The live session of `h160`, or null; a session of another wallet is discarded. */
export const useHbrSession = (h160: string) => {
  const session = useHbrSessionStore((state) => state.session)
  const clear = useHbrSessionStore((state) => state.clear)
  const restore = useHbrSessionStore((state) => state.restore)
  const live = liveSessionFor(session, h160)
  const mismatched = !!session && !live
  // After a reload in the same tab: this wallet's stored session, if any.
  const restored = useMemo(
    () => (session ? null : readStoredSession(h160)),
    [session, h160],
  )

  useEffect(() => {
    if (mismatched) clear()
    else if (restored) restore(restored)
  }, [mismatched, restored, clear, restore])

  return live ?? restored
}

export const useHbrMe = (h160: string) =>
  useQuery(hbrMeQuery(useHbrService(), h160))

export const useHbrOnboarding = (h160: string) =>
  useQuery(hbrOnboardingQuery(useHbrService(), h160))

// The connected wallet as last seen by any mounted bank screen or the app's
// session guard. A sign-in reads it when its signature returns: the screen
// that started it may have unmounted on the wallet switch (its own view of
// the account is then stale).
let connectedWallet: string | null = null

/** Keeps `connectedWallet` current; called by BankFlow, BankPortfolio and HbrSessionGuard. */
export const useTrackConnectedWallet = () => {
  const { account } = useAccount()
  const wallet = account?.rawAddress.toLowerCase() ?? null
  useLayoutEffect(() => {
    connectedWallet = wallet
  }, [wallet])
}

export const useHbrSignIn = (h160: string, signer: MessageSigner) => {
  const isConnected = useCallback(
    () => connectedWallet === h160.toLowerCase(),
    [h160],
  )
  return useMutation(
    hbrSignInMutation(useHbrService(), h160, signer, isConnected),
  )
}

export const useHbrSignOut = (h160: string) =>
  useMutation(hbrSignOutMutation(useHbrService(), useQueryClient(), h160))

export const useHbrCreateCustomer = (h160: string) =>
  useMutation(
    hbrCreateCustomerMutation(useHbrService(), useQueryClient(), h160),
  )

export const useHbrBindWallet = (h160: string, signer: MessageSigner) =>
  useMutation(
    hbrBindWalletMutation(useHbrService(), useQueryClient(), h160, signer),
  )

export const useHbrBankAccounts = (h160: string) =>
  useQuery(hbrBankAccountsQuery(useHbrService(), h160))

export const useHbrCreateBankAccount = (h160: string) =>
  useMutation(
    hbrCreateBankAccountMutation(useHbrService(), useQueryClient(), h160),
  )

export const useHbrRemoveBankAccount = (h160: string) =>
  useMutation(
    hbrRemoveBankAccountMutation(useHbrService(), useQueryClient(), h160),
  )

export const useHbrOnrampAccounts = (h160: string) =>
  useQuery(hbrOnrampAccountsQuery(useHbrService(), h160))

export const useHbrRequestOnrampAccount = (h160: string) =>
  useMutation(
    hbrRequestOnrampAccountMutation(useHbrService(), useQueryClient(), h160),
  )

export const useHbrRetryOnrampAccount = (h160: string) =>
  useMutation(
    hbrRetryOnrampAccountMutation(useHbrService(), useQueryClient(), h160),
  )

export const useHbrDeposits = (h160: string) =>
  useQuery(hbrDepositsQuery(useHbrService(), h160))

export const useHbrQuoteRamp = (h160: string) =>
  useMutation(hbrQuoteRampMutation(useHbrService(), h160))

export const useHbrBuildRamp = (
  h160: string,
  onPrepared: (prepared: PreparedCashOut) => void,
) =>
  useMutation(
    hbrBuildRampMutation(useHbrService(), useQueryClient(), h160, onPrepared),
  )

export const useHbrRamps = (h160: string) =>
  useQuery(hbrRampsQuery(useHbrService(), h160))

export const useHbrRamp = (h160: string, rampId: string) =>
  useQuery(hbrRampQuery(useHbrService(), h160, rampId))

/**
 * Whether an HBR action is pending, read from the mutation cache (so it holds
 * across a remount), and a starter that refuses to send while it is.
 */
export const useHbrActionInFlight = (
  h160: string,
  action: string,
  variables?: unknown,
) => {
  const queryClient = useQueryClient()
  const filter = hbrPendingFilter(h160, action, variables)
  const pending = useIsMutating(filter) > 0
  const isFree = () => queryClient.isMutating(filter) === 0
  return { pending, isFree }
}

/**
 * Ends the bank session locally: the token in memory and in sessionStorage,
 * and every HBR query of every wallet (HbrSessionGuard, on a wallet change).
 */
export const useHbrClearSession = () => {
  const queryClient = useQueryClient()
  return useCallback(() => {
    // Local first (as hbrSignOutMutation): capture the token, clear memory,
    // sessionStorage and queries, and only then revoke at the server. The
    // DELETE is best effort: one try, every outcome ignored, never awaited.
    const session = useHbrSessionStore.getState().session
    useHbrSessionStore.getState().clear()
    queryClient.removeQueries({ queryKey: hbrQueryKeys.all() })
    if (!session) return
    void hbrService
      .forWallet(session.h160)
      .closeSession(session.token)
      .catch(() => undefined)
  }, [queryClient])
}
