import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { Trans } from "react-i18next"
import { ToastMessage, useStore } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"
import { getChainSpecificAddress } from "utils/formatting"
import { QUERY_KEYS } from "utils/queryKeys"
import { shortenAccountAddress } from "utils/formatting"

export type CodeFormValues = {
  referralCode: string
}

export enum UserState {
  FUNDED,
  NOT_FUNDED,
  DISCONECTED,
  UNKNOWN,
}

export const defaultCodeFormValues: CodeFormValues = {
  referralCode: "",
}

export function getUserState(address?: string, isBalance?: boolean): UserState {
  if (!address) {
    return UserState.DISCONECTED
  }

  if (isBalance) {
    return UserState.FUNDED
  }

  if (isBalance === false) {
    return UserState.NOT_FUNDED
  }

  return UserState.UNKNOWN
}

export const useRegisterReferralCode = () => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  return useMutation(
    async ({
      referralCode,
      accountAddress,
    }: {
      referralCode: string
      accountAddress: string
    }) => {
      const toast = TOAST_MESSAGES.reduce((memo, type) => {
        const msType = type === "onError" ? "onLoading" : type
        memo[type] = (
          <>
            <Trans
              i18nKey={`referrals.toasts.generateCode.${msType}`}
              tOptions={{
                account: shortenAccountAddress(
                  getChainSpecificAddress(accountAddress),
                ),
                code: referralCode,
              }}
            >
              <span />
            </Trans>
          </>
        )
        return memo
      }, {} as ToastMessage)

      return await createTransaction(
        { tx: api.tx.referrals.registerCode(referralCode) },
        { toast },
      )
    },
    {
      onSuccess: (_, variables) =>
        queryClient.invalidateQueries(
          QUERY_KEYS.referralCodes(variables.accountAddress),
        ),
    },
  )
}
