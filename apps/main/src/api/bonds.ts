import { useMutation } from "@tanstack/react-query"
import { differenceInMilliseconds } from "date-fns"
import { useTranslation } from "react-i18next"

import { useBestNumber } from "@/api/chain"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalance } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

export const useBondData = (bondId: string) => {
  const { data: bestNumber } = useBestNumber()
  const { getBond } = useAssets()
  const assetBalance = useAccountBalance(bondId)

  const bond = getBond(bondId)
  const balance = assetBalance?.transferable ?? 0n
  const maturity = bond?.maturity ?? 0
  const timeLeft =
    maturity && bestNumber
      ? differenceInMilliseconds(maturity, bestNumber.timestamp)
      : 0

  const isMatured = timeLeft < 0

  return {
    bond,
    balance,
    maturity,
    timeLeft,
    isMatured,
  }
}

type RedeemBondArgs = {
  bondId: string
  amount: bigint
}

export const useRedeemBond = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { papi } = useRpcProvider()
  const { getBond } = useAssets()
  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: ({ bondId, amount }: RedeemBondArgs) => {
      const bond = getBond(bondId)

      if (!bond) throw new Error(`Bond (${bondId}) not found`)

      const formattedAmount = t("common:currency", {
        value: toDecimal(amount, bond.decimals),
        suffix: ` ${bond.symbol}`,
      })

      return createTransaction({
        tx: papi.tx.Bonds.redeem({
          bond_id: Number(bond.id),
          amount,
        }),
        toasts: {
          submitted: t("myBonds.redeem.toast.submitted", {
            amount: formattedAmount,
            symbol: bond.symbol,
          }),
          success: t("myBonds.redeem.toast.success", {
            amount: formattedAmount,
            symbol: bond.symbol,
          }),
        },
      })
    },
  })
}
