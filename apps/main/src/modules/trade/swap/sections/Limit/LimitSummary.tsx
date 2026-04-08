import { SummaryRowValue } from "@galacticcouncil/ui/components"
import { formatNumber } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { iceFeeQuery } from "@/api/intents"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useRpcProvider } from "@/providers/rpcProvider"

const ICE_FEE_PERMILL = 1_000_000

export const LimitSummary: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const rpc = useRpcProvider()
  const { watch } = useFormContext<LimitFormValues>()

  const [buyAsset, buyAmount] = watch(["buyAsset", "buyAmount"])

  const { data: iceFee } = useQuery(iceFeeQuery(rpc))

  const iceFeePercent = useMemo(() => {
    if (!iceFee) return null
    try {
      return Big(iceFee).div(10_000).toFixed(2)
    } catch {
      return null
    }
  }, [iceFee])

  const minReceive = useMemo(() => {
    if (!iceFee || !buyAsset) return null
    try {
      const amt = Big(buyAmount || "0")
      if (amt.lte(0)) return null
      const net = amt.times(Big(1).minus(Big(iceFee).div(ICE_FEE_PERMILL)))
      return formatNumber(net.toString())
    } catch {
      return null
    }
  }, [buyAmount, iceFee, buyAsset])

  if (iceFeePercent === null) return null

  return (
    <>
      {minReceive && buyAsset && (
        <SwapSummaryRow
          label={t("trade:market.summary.minReceived")}
          content={
            <SummaryRowValue>
              {minReceive} {buyAsset.symbol}
            </SummaryRowValue>
          }
        />
      )}
      <SwapSummaryRow
        label="ICE fee"
        content={<SummaryRowValue>{iceFeePercent}%</SummaryRowValue>}
      />
    </>
  )
}
