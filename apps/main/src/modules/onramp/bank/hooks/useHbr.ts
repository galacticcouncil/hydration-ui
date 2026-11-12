import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useEffect } from "react"

import { ENV } from "@/config/env"
import type { CustomerType } from "@/modules/onramp/bank/config/schemas"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
import { createHbrService } from "@/modules/onramp/bank/utils/createHbrService"
import { HbrApiError } from "@/modules/onramp/bank/utils/hbrErrors"
import type { HbrService } from "@/modules/onramp/bank/utils/hbrService"
import { isRailOpen } from "@/modules/onramp/bank/utils/onboarding"
import { hbrQueryKeys } from "@/modules/onramp/bank/utils/queryKeys"

// About every 10 s while the user is in the hosted flow (API doc 2 step 5;
// the onboarding read is limited to 6 a minute per wallet).
export const ONBOARDING_POLL_MS = 10_000

const hbrService = createHbrService({
  baseUrl: ENV.VITE_HBR_API_URL,
  session: {
    getToken: () => useHbrSessionStore.getState().session?.token ?? null,
    onUnauthorized: (token) => {
      if (token) useHbrSessionStore.getState().discardToken(token)
      else useHbrSessionStore.getState().clear()
    },
  },
})

export const useHbrService = (): HbrService => hbrService

/** A signer that can `personal_sign` a message exactly as given. */
export type MessageSigner = {
  signMessage: (message: string) => Promise<string>
}

/** The live session of `h160`, or null; a session of another wallet is discarded. */
export const useHbrSession = (h160: string) => {
  const session = useHbrSessionStore((state) => state.session)
  const clear = useHbrSessionStore((state) => state.clear)
  const mismatched = !!session && session.h160 !== h160

  useEffect(() => {
    if (mismatched) clear()
  }, [mismatched, clear])

  return mismatched ? null : session
}

// ---- Queries -----------------------------------------------------------

export const hbrMeQuery = (service: HbrService, h160: string) =>
  queryOptions({
    queryKey: hbrQueryKeys.me(h160),
    queryFn: () => service.getMe(),
    retry: false,
    staleTime: 0,
  })

export const hbrOnboardingQuery = (service: HbrService, h160: string) =>
  queryOptions({
    queryKey: hbrQueryKeys.onboarding(h160),
    queryFn: () => service.getOnboarding(),
    // Rule 12: a 401 is never repeated; reads are repeated by the poll only.
    retry: false,
    staleTime: 0,
    // The answer carries bearer links: keep it no longer than the screen.
    gcTime: 0,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data || !data.bound) return false
      return isRailOpen(data.rails.usd) || isRailOpen(data.rails.eur)
        ? false
        : ONBOARDING_POLL_MS
    },
  })

export const useHbrMe = (h160: string) =>
  useQuery(hbrMeQuery(useHbrService(), h160))

export const useHbrOnboarding = (h160: string) =>
  useQuery(hbrOnboardingQuery(useHbrService(), h160))

// ---- Mutations ---------------------------------------------------------

/** challenge -> personal_sign -> session (API doc 2 step 1). */
export const useHbrSignIn = (h160: string, signer: MessageSigner) => {
  const service = useHbrService()
  const setSession = useHbrSessionStore((state) => state.setSession)

  return useMutation({
    mutationFn: async () => {
      const challenge = await service.createChallenge(h160)
      const signature = await signer.signMessage(challenge.message)
      const session = await service.openSession({
        nonce: challenge.nonce,
        signature,
      })
      // The server's wallet must be this wallet; otherwise keep no session.
      if (session.h160.toLowerCase() !== h160)
        throw new Error("HBR session opened for another wallet")
      setSession(session)
    },
  })
}

export const useHbrSignOut = () => {
  const service = useHbrService()
  const queryClient = useQueryClient()
  const clear = useHbrSessionStore((state) => state.clear)

  return useMutation({
    mutationFn: async () => {
      try {
        await service.closeSession()
      } finally {
        // Signed out locally whatever the answer; the token is gone either way.
        clear()
        queryClient.removeQueries({ queryKey: hbrQueryKeys.all() })
      }
    },
  })
}

const useInvalidateOnboarding = (h160: string) => {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: hbrQueryKeys.wallet(h160) })
}

/** POST /v1/customers (API doc 2 step 3). The screen re-reads onboarding after every outcome. */
export const useHbrCreateCustomer = (h160: string) => {
  const service = useHbrService()
  const invalidate = useInvalidateOnboarding(h160)

  return useMutation({
    mutationFn: (type: CustomerType) => service.createCustomer(type),
    onSettled: invalidate,
  })
}

/** bind challenge -> personal_sign -> verify (API doc 2 step 4). */
export const useHbrBindWallet = (h160: string, signer: MessageSigner) => {
  const service = useHbrService()
  const invalidate = useInvalidateOnboarding(h160)

  return useMutation({
    mutationFn: async () => {
      try {
        const challenge = await service.createBindChallenge()
        const signature = await signer.signMessage(challenge.message)
        await service.verifyBind({ nonce: challenge.nonce, signature })
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
    onSettled: invalidate,
  })
}
