import Big from "big.js"
import { FC } from "react"
import { FormProvider } from "react-hook-form"

import { PeriodType } from "@/components"
import { DCAFooter } from "@/modules/trade/sections/DCA/DCAFooter"
import { DCAForm } from "@/modules/trade/sections/DCA/DCAForm"
import { DCASummary } from "@/modules/trade/sections/DCA/DCASummary"
import { useDcaOrder } from "@/modules/trade/sections/DCA/temp"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { TAsset } from "@/providers/assetsProvider"
import { NATIVE_ASSET_ID, PARACHAIN_BLOCK_TIME } from "@/utils/consts"
import { scale } from "@/utils/formatting"

import { useDCAForm } from "./DCA.form"

export const SECOND_MS = 1000
export const MINUTE_MS = SECOND_MS * 60
export const HOUR_MS = MINUTE_MS * 60
export const DAY_MS = HOUR_MS * 24
export const WEEK_MS = DAY_MS * 7
export const MONTH_MS = DAY_MS * 30

export const INTERVAL_DCA_MS: Record<PeriodType, number> = {
  hour: HOUR_MS,
  day: DAY_MS,
  week: WEEK_MS,
  month: MONTH_MS,
}

export function exchangeNative(
  exchangeRate: string,
  asset: TAsset,
  amountNative: string,
): string {
  if (NATIVE_ASSET_ID === asset.id) {
    return amountNative
  }

  return Big(amountNative).div(exchangeRate).toString()
}

export const DCA: FC = () => {
  const form = useDCAForm()

  const [sellAsset, buyAsset, sellAmount, interval] = form.watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
    "interval",
  ])

  const order = useDcaOrder(
    sellAsset,
    buyAsset,
    interval,
    sellAmount || "0",
    PARACHAIN_BLOCK_TIME,
  )

  console.log(order)

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(console.log)}>
        <DCAForm />
        <SwapSectionSeparator />
        <DCASummary />
        <SwapSectionSeparator />
        <DCAFooter />
      </form>
    </FormProvider>
  )
}
