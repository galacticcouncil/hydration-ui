import {
  mutationOptions,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query"

import type { CustomerType } from "@/modules/onramp/bank/config/schemas"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
import {
  HbrApiError,
  HbrResponseError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import type { HbrService } from "@/modules/onramp/bank/utils/hbrService"
import { isRailOpen } from "@/modules/onramp/bank/utils/onboarding"
import { hbrQueryKeys } from "@/modules/onramp/bank/utils/queryKeys"
import { SENSITIVE_QUERY_META } from "@/utils/queryErrorLog"

// About every 10 s while the user is in the hosted flow (API doc 2 step 5;
// the onboarding read is limited to 6 a minute per wallet).
export const ONBOARDING_POLL_MS = 10_000

/** A signer that can `personal_sign` a message exactly as given. */
export type MessageSigner = {
  signMessage: (message: string) => Promise<string>
}

// Every HBR query and mutation carries SENSITIVE_QUERY_META: the app's global
// react-query error log then prints its key and error only, never its data
// (bearer links) or variables (signatures, later bank details).

// `h160` is the SESSION's wallet: keys and tokens are both bound to it.
export const hbrMeQuery = (service: HbrService, h160: string) =>
  queryOptions({
    queryKey: hbrQueryKeys.me(h160),
    queryFn: () => service.forWallet(h160).getMe(),
    meta: SENSITIVE_QUERY_META,
    retry: false,
    staleTime: 0,
  })

export const hbrOnboardingQuery = (service: HbrService, h160: string) =>
  queryOptions({
    queryKey: hbrQueryKeys.onboarding(h160),
    queryFn: () => service.forWallet(h160).getOnboarding(),
    meta: SENSITIVE_QUERY_META,
    // Rule 12: a 401 is never repeated; reads are repeated by the poll only.
    retry: false,
    staleTime: 0,
    // The answer carries bearer links: dropped once no screen observes it.
    gcTime: 0,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data || !data.bound) return false
      return isRailOpen(data.rails.usd) || isRailOpen(data.rails.eur)
        ? false
        : ONBOARDING_POLL_MS
    },
  })

/** challenge -> personal_sign -> session (API doc 2 step 1). */
export const hbrSignInMutation = (
  service: HbrService,
  h160: string,
  signer: MessageSigner,
) =>
  mutationOptions({
    meta: SENSITIVE_QUERY_META,
    mutationFn: async () => {
      const challenge = await service.createChallenge(h160)
      const signature = await signer.signMessage(challenge.message)
      const session = await service.openSession({
        nonce: challenge.nonce,
        signature,
      })
      // The server's wallet must be this wallet; otherwise keep no session.
      if (session.h160.toLowerCase() !== h160.toLowerCase())
        throw new HbrResponseError(200)
      useHbrSessionStore.getState().setSession(session)
    },
  })

export const hbrSignOutMutation = (
  service: HbrService,
  queryClient: QueryClient,
  h160: string,
) =>
  mutationOptions({
    meta: SENSITIVE_QUERY_META,
    mutationFn: async () => {
      try {
        await service.forWallet(h160).closeSession()
      } finally {
        // Signed out locally whatever the answer; this wallet's token is gone.
        const { session, discardToken } = useHbrSessionStore.getState()
        if (session && session.h160 === h160.toLowerCase())
          discardToken(session.token)
        queryClient.removeQueries({ queryKey: hbrQueryKeys.wallet(h160) })
      }
    },
  })

const invalidateWallet = (queryClient: QueryClient, h160: string) => () =>
  queryClient.invalidateQueries({ queryKey: hbrQueryKeys.wallet(h160) })

/** POST /v1/customers (API doc 2 step 3). The screen re-reads onboarding after every outcome. */
export const hbrCreateCustomerMutation = (
  service: HbrService,
  queryClient: QueryClient,
  h160: string,
) =>
  mutationOptions({
    meta: SENSITIVE_QUERY_META,
    mutationFn: (type: CustomerType) =>
      service.forWallet(h160).createCustomer(type),
    onSettled: invalidateWallet(queryClient, h160),
  })

/**
 * bind challenge -> personal_sign -> verify (API doc 2 step 4). Both calls go
 * through `forWallet(h160)`: if the session changed to another wallet while
 * the signature was open, the verify is not sent.
 */
export const hbrBindWalletMutation = (
  service: HbrService,
  queryClient: QueryClient,
  h160: string,
  signer: MessageSigner,
) =>
  mutationOptions({
    meta: SENSITIVE_QUERY_META,
    mutationFn: async () => {
      const api = service.forWallet(h160)
      try {
        const challenge = await api.createBindChallenge()
        const signature = await signer.signMessage(challenge.message)
        await api.verifyBind({ nonce: challenge.nonce, signature })
      } catch (error) {
        // Already bound is the state we wanted; the re-read shows it.
        if (
          error instanceof HbrApiError &&
          error.status === 409 &&
          error.code === "already_bound"
        )
          return
        throw error
      }
    },
    onSettled: invalidateWallet(queryClient, h160),
  })
