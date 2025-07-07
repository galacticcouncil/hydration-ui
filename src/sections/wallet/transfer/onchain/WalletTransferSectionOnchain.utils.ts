import { useAssets } from "providers/assets"
import { usePaymentInfo } from "api/transaction"
import BN from "bignumber.js"
import { t } from "i18next"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_0 } from "utils/constants"
import { H160, isEvmAddress, safeConvertAddressH160 } from "utils/evm"
import { safeConvertAddressSS58 } from "utils/formatting"
import { maxBalance, required } from "utils/validators"
import { z } from "zod"
import { useAccountBalances } from "api/deposits"

export function usePaymentFees({
  asset,
  currentAmount,
  maxAmount,
}: {
  asset: string
  currentAmount: BN
  maxAmount: BN
}) {
  const { api } = useRpcProvider()
  const { native } = useAssets()

  const formattedCurrentAmount = !currentAmount?.isNaN()
    ? currentAmount.toString()
    : "0"

  const { data: currentData } = usePaymentInfo(
    asset.toString() === native.id
      ? api.tx.currencies.transfer("", native.id, formattedCurrentAmount)
      : api.tx.tokens.transfer("", asset, formattedCurrentAmount),
  )

  const formattedMaxAmount = !maxAmount?.isNaN() ? maxAmount.toString() : "0"

  const { data: maxData } = usePaymentInfo(
    asset.toString() === native.id
      ? api.tx.currencies.transfer("", native.id, formattedMaxAmount)
      : api.tx.tokens.transfer("", asset, formattedMaxAmount),
  )

  return {
    currentFee: currentData?.partialFee.toBigNumber() ?? BN_0,
    maxFee: maxData?.partialFee.toBigNumber() ?? BN_0,
  }
}

export const getDestZodSchema = (currentAddress?: string) =>
  z.object({
    dest: required
      .refine(
        (value) =>
          !!safeConvertAddressSS58(value, 0) || !!safeConvertAddressH160(value),

        {
          message: t("wallet.assets.transfer.error.validAddress"),
        },
      )
      .refine(
        (value) => {
          if (!currentAddress) return false

          if (isEvmAddress(safeConvertAddressH160(value) ?? "")) {
            return (
              H160.fromAccount(currentAddress).toLowerCase() !==
              value.toLowerCase()
            )
          } else {
            const from = safeConvertAddressSS58(currentAddress.toString(), 0)
            const to = safeConvertAddressSS58(value, 0)

            if (from && to && from === to) {
              return false
            }

            return true
          }
        },
        {
          message: t("wallet.assets.transfer.error.notSame"),
        },
      ),
  })

export const useTransferZodSchema = (assetId: string) => {
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const { data: accountAssets } = useAccountBalances()

  const { decimals } = getAssetWithFallback(assetId)

  const assetBalance = accountAssets?.accountAssetsMap.get(assetId)?.balance

  if (assetBalance === undefined) return undefined

  return z
    .object({
      amount: required.pipe(maxBalance(assetBalance.balance, decimals)),
    })
    .merge(getDestZodSchema(account?.address))
}
