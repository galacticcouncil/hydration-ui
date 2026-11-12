import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { ENV } from "@/config/env"
import {
  hbrBankAccountsQuery,
  hbrBindWalletMutation,
  hbrCreateBankAccountMutation,
  hbrCreateCustomerMutation,
  hbrDepositsQuery,
  hbrMeQuery,
  hbrOnboardingQuery,
  hbrOnrampAccountsQuery,
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
  useHbrSessionStore,
} from "@/modules/onramp/bank/store/useHbrSessionStore"
import { createHbrService } from "@/modules/onramp/bank/utils/createHbrService"
import type { HbrService } from "@/modules/onramp/bank/utils/hbrService"

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
  const live = liveSessionFor(session, h160)
  const mismatched = !!session && !live

  useEffect(() => {
    if (mismatched) clear()
  }, [mismatched, clear])

  return live
}

export const useHbrMe = (h160: string) =>
  useQuery(hbrMeQuery(useHbrService(), h160))

export const useHbrOnboarding = (h160: string) =>
  useQuery(hbrOnboardingQuery(useHbrService(), h160))

export const useHbrSignIn = (h160: string, signer: MessageSigner) =>
  useMutation(hbrSignInMutation(useHbrService(), h160, signer))

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
