import {
  MutationFilters,
  mutationOptions,
  QueryClient,
  queryOptions,
} from "@tanstack/react-query"

import type {
  CreateBankAccountRequest,
  CustomerType,
  OnrampCurrency,
  RampRequest,
} from "@/modules/onramp/bank/config/schemas"
import { useHbrSessionStore } from "@/modules/onramp/bank/store/useHbrSessionStore"
import {
  HbrApiError,
  HbrResponseError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import {
  PreparedCashOut,
  toPreparedCashOut,
} from "@/modules/onramp/bank/utils/cashOut"
import type { HbrService } from "@/modules/onramp/bank/utils/hbrService"
import { isRailOpen } from "@/modules/onramp/bank/utils/onboarding"
import { getOnrampPollInterval } from "@/modules/onramp/bank/utils/onramp"
import { hbrQueryKeys } from "@/modules/onramp/bank/utils/queryKeys"

// About every 10 s while the user is in the hosted flow (API doc 2 step 5;
// the onboarding read is limited to 6 a minute per wallet).
export const ONBOARDING_POLL_MS = 10_000

/**
 * Every HBR query and mutation runs whatever the browser's online state: an
 * offline call fails at once as HbrNetworkError ("could not confirm") instead
 * of pausing, so no HBR mutation is ever paused and kept for later (react-query
 * persists paused mutations, variables included).
 */
export const HBR_NETWORK_MODE = "always" as const

/** A signer that can `personal_sign` a message exactly as given. */
export type MessageSigner = {
  signMessage: (message: string) => Promise<string>
}

// Every HBR query and mutation key starts with HBR_QUERY_KEY_PREFIX, a root of
// SENSITIVE_KEY_ROOTS (utils/queryErrorLog.ts): the app's global react-query
// error log then prints its key and error only, never its data (bearer links,
// deposit instructions) or variables (bank details). Mutations need their key
// for that, so every one below sets `mutationKey`.

// `h160` is the SESSION's wallet: keys and tokens are both bound to it.
export const hbrMeQuery = (service: HbrService, h160: string) =>
  queryOptions({
    networkMode: HBR_NETWORK_MODE,
    queryKey: hbrQueryKeys.me(h160),
    queryFn: () => service.forWallet(h160).getMe(),
    retry: false,
    staleTime: 0,
  })

export const hbrOnboardingQuery = (service: HbrService, h160: string) =>
  queryOptions({
    networkMode: HBR_NETWORK_MODE,
    queryKey: hbrQueryKeys.onboarding(h160),
    queryFn: () => service.forWallet(h160).getOnboarding(),
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
    networkMode: HBR_NETWORK_MODE,
    mutationKey: hbrQueryKeys.mutation(h160, "signIn"),
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
    networkMode: HBR_NETWORK_MODE,
    mutationKey: hbrQueryKeys.mutation(h160, "signOut"),
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
    networkMode: HBR_NETWORK_MODE,
    mutationKey: hbrQueryKeys.mutation(h160, "createCustomer"),
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
    networkMode: HBR_NETWORK_MODE,
    mutationKey: hbrQueryKeys.mutation(h160, "bindWallet"),
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

// ---- Stage 2: bank accounts, on-ramp accounts, deposits -----------------

// GET /v1/onramp/deposits is limited to 30 a minute (API doc 1, rate limits);
// the on-ramp accounts interval is getOnrampPollInterval (utils/onramp.ts).
export const DEPOSITS_POLL_MS = 30_000

export const hbrBankAccountsQuery = (service: HbrService, h160: string) =>
  queryOptions({
    networkMode: HBR_NETWORK_MODE,
    queryKey: hbrQueryKeys.bankAccounts(h160),
    queryFn: () => service.forWallet(h160).listBankAccounts(),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  })

/** POST /v1/bank-accounts. Variables are bank details: the key keeps them out of the log. */
export const hbrCreateBankAccountMutation = (
  service: HbrService,
  queryClient: QueryClient,
  h160: string,
) =>
  mutationOptions({
    networkMode: HBR_NETWORK_MODE,
    mutationKey: hbrQueryKeys.mutation(h160, "createBankAccount"),
    mutationFn: (body: CreateBankAccountRequest) =>
      service.forWallet(h160).createBankAccount(body),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: hbrQueryKeys.bankAccounts(h160),
      }),
  })

/** DELETE /v1/bank-accounts/:id, then the list is read again; nothing is removed locally first. */
export const hbrRemoveBankAccountMutation = (
  service: HbrService,
  queryClient: QueryClient,
  h160: string,
) =>
  mutationOptions({
    networkMode: HBR_NETWORK_MODE,
    mutationKey: hbrQueryKeys.mutation(h160, "removeBankAccount"),
    mutationFn: (id: string) => service.forWallet(h160).deleteBankAccount(id),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: hbrQueryKeys.bankAccounts(h160),
      }),
  })

export const hbrOnrampAccountsQuery = (service: HbrService, h160: string) =>
  queryOptions({
    networkMode: HBR_NETWORK_MODE,
    queryKey: hbrQueryKeys.onrampAccounts(h160),
    // Every call is one real request; the server is the only limiter.
    queryFn: () => service.forWallet(h160).listOnrampAccounts(),
    retry: false,
    staleTime: 0,
    // Deposit instructions: never kept past the screen (rule 5).
    gcTime: 0,
    // Polled while shown, so a status change removes instructions at once;
    // faster while preparing, backing off after a 429 (getOnrampPollInterval).
    refetchInterval: (query) =>
      getOnrampPollInterval(query.state.data, query.state.error),
    // No extra read on window focus (the server limits this route; the
    // screen does not hold that limit, see ONRAMP_POLL_MS).
    refetchOnWindowFocus: false,
  })

const invalidateOnramp = (queryClient: QueryClient, h160: string) => () =>
  queryClient.invalidateQueries({ queryKey: hbrQueryKeys.onrampAccounts(h160) })

export const hbrRequestOnrampAccountMutation = (
  service: HbrService,
  queryClient: QueryClient,
  h160: string,
) =>
  mutationOptions({
    networkMode: HBR_NETWORK_MODE,
    mutationKey: hbrQueryKeys.mutation(h160, "requestOnrampAccount"),
    mutationFn: (currency: OnrampCurrency) =>
      service.forWallet(h160).requestOnrampAccount(currency),
    onSettled: invalidateOnramp(queryClient, h160),
  })

/** The re-arm lever (rule 6). Offered only on `retryAllowed`; never repeated automatically. */
export const hbrRetryOnrampAccountMutation = (
  service: HbrService,
  queryClient: QueryClient,
  h160: string,
) =>
  mutationOptions({
    networkMode: HBR_NETWORK_MODE,
    mutationKey: hbrQueryKeys.mutation(h160, "retryOnrampAccount"),
    mutationFn: (currency: OnrampCurrency) =>
      service.forWallet(h160).retryOnrampAccount(currency),
    onSettled: invalidateOnramp(queryClient, h160),
  })

export const hbrDepositsQuery = (service: HbrService, h160: string) =>
  queryOptions({
    networkMode: HBR_NETWORK_MODE,
    queryKey: hbrQueryKeys.deposits(h160),
    queryFn: () => service.forWallet(h160).listDeposits(),
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchInterval: DEPOSITS_POLL_MS,
  })

// ---- Stage 3: cash-out ---------------------------------------------------

// GET /v1/ramps/:id is limited to 60 a minute, GET /v1/ramps to 30 (API doc 1).
export const RAMP_POLL_MS = 5_000
export const RAMPS_POLL_MS = 30_000
export const RAMP_BACKOFF_MS = 60_000

const isRateLimited = (error: unknown) =>
  error instanceof HbrApiError && error.status === 429

/** POST /v1/ramps/quote: read-only; records nothing (API doc 4). */
export const hbrQuoteRampMutation = (service: HbrService, h160: string) =>
  mutationOptions({
    networkMode: HBR_NETWORK_MODE,
    mutationKey: hbrQueryKeys.mutation(h160, "quoteRamp"),
    mutationFn: (body: RampRequest) =>
      service.forWallet(h160).quoteRamp(body),
  })

/**
 * POST /v1/ramps, the binding build. The unsigned transactions go to
 * `onPrepared` and nowhere else: the mutation's data (kept in the mutation
 * cache) is the answer WITHOUT approveTx and redeemTx. Never repeated
 * automatically (rule 12).
 */
export const hbrBuildRampMutation = (
  service: HbrService,
  queryClient: QueryClient,
  h160: string,
  onPrepared: (prepared: PreparedCashOut) => void,
) =>
  mutationOptions({
    networkMode: HBR_NETWORK_MODE,
    mutationKey: hbrQueryKeys.mutation(h160, "buildRamp"),
    mutationFn: async (body: RampRequest) => {
      const res = await service.forWallet(h160).buildRamp(body)
      onPrepared(toPreparedCashOut(res))
      const { approveTx: _approve, redeemTx: _redeem, ...view } = res
      return view
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: hbrQueryKeys.ramps(h160) }),
  })

export const hbrRampsQuery = (service: HbrService, h160: string) =>
  queryOptions({
    networkMode: HBR_NETWORK_MODE,
    queryKey: hbrQueryKeys.ramps(h160),
    queryFn: () => service.forWallet(h160).listRamps(),
    retry: false,
    staleTime: 0,
    refetchInterval: (query) =>
      isRateLimited(query.state.error) ? RAMP_BACKOFF_MS : RAMPS_POLL_MS,
  })

/** One ramp, polled while shown: no status is an ending the screen may stop on (rule 13). */
export const hbrRampQuery = (
  service: HbrService,
  h160: string,
  rampId: string,
) =>
  queryOptions({
    networkMode: HBR_NETWORK_MODE,
    queryKey: hbrQueryKeys.ramp(h160, rampId),
    queryFn: () => service.forWallet(h160).getRamp(rampId),
    retry: false,
    staleTime: 0,
    refetchInterval: (query) =>
      isRateLimited(query.state.error) ? RAMP_BACKOFF_MS : RAMP_POLL_MS,
  })

/**
 * The pending HBR mutations of one action (and, when given, one variable such
 * as a currency) in the mutation CACHE, not in a component: a guard built on it
 * survives a remount (a tab switch), so a second POST is not sent while the
 * first is pending.
 */
export const hbrPendingFilter = (
  h160: string,
  action: string,
  variables?: unknown,
): MutationFilters => ({
  mutationKey: hbrQueryKeys.mutation(h160, action),
  status: "pending",
  predicate:
    variables === undefined
      ? undefined
      : (mutation) => mutation.state.variables === variables,
})
