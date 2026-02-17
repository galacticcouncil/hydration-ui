import {
  normalizeSS58Address,
  shortenAccountAddress,
} from "@galacticcouncil/utils"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { isNumber } from "remeda"

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
  const { isErc20 } = useAssets()

  const rpc = useRpcProvider()
  const { papi } = rpc

  return useMutation({
    mutationFn: async ({
      asset,
      amount,
      address,
    }: TransferPositionFormValues) => {
      if (!isNumber(asset?.decimals)) {
        throw new Error("Missing asset meta")
      }

      const amountScaled = scale(amount, asset.decimals)
      const normalizedDest = normalizeSS58Address(address)

      return createTransaction({
        withExtraGas: isErc20(asset),
        tx: papi.tx.Currencies.transfer({
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
  })
}
