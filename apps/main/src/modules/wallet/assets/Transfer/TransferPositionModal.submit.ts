import {
  safeConvertAddressSS58,
  shortenAccountAddress,
} from "@galacticcouncil/utils"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useRefetchAccountBalance } from "@/api/account"
import { TransferPositionFormValues } from "@/modules/wallet/assets/Transfer/TransferPosition.form"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

type Props = {
  readonly onClose: () => void
}

export const useSubmitTransferPosition = ({ onClose }: Props) => {
  const { t } = useTranslation("wallet")
  const { createTransaction } = useTransactionsStore()
  const { native } = useAssets()

  const rpc = useRpcProvider()
  const { papi } = rpc

  const refetchAccountBalance = useRefetchAccountBalance()

  return useMutation({
    mutationFn: async ({
      asset,
      amount,
      address,
    }: TransferPositionFormValues) => {
      if (asset?.decimals == null) {
        throw new Error("Missing asset meta")
      }

      const amountScaled = scale(amount, asset.decimals)
      const normalizedDest = safeConvertAddressSS58(address) ?? address

      return createTransaction({
        tx:
          asset.id === native.id
            ? papi.tx.Currencies.transfer({
                currency_id: Number(native.id),
                dest: normalizedDest,
                amount: BigInt(amountScaled),
              })
            : papi.tx.Tokens.transfer({
                currency_id: Number(asset.id),
                dest: normalizedDest,
                amount: BigInt(amountScaled),
              }),
        // TODO insufficient fee check
        // overrides: insufficientFee
        //   ? {
        //       fee: currentFee,
        //       feeExtra: insufficientFee.value,
        //       currencyId: accountCurrencyMeta?.id,
        //     }
        //   : undefined,
        toasts: {
          submitted: t("transfer.modal.onLoading", {
            amount,
            symbol: asset.symbol,
            address: shortenAccountAddress(normalizedDest, 12),
          }),
          success: t("transfer.modal.onSuccess", {
            amount,
            symbol: asset.symbol,
            address: shortenAccountAddress(normalizedDest, 12),
          }),
          error: t("transfer.modal.onError", {
            amount,
            symbol: asset.symbol,
            address: shortenAccountAddress(normalizedDest, 12),
          }),
        },
      })
    },
    onMutate: onClose,
    onSuccess: () => refetchAccountBalance(),
  })
}
