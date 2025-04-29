import { ProgressBar, Skeleton, Text } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"

import { scaleHuman } from "@/utils/formatting"

import { useInitialOtcOfferAmount } from "./OfferStatusColumn.utils"

type Props = {
  readonly offerId: string | undefined
  readonly assetInAmount: string
  readonly assetInDecimals: number
  readonly isPartiallyFillable: boolean
}

export const OfferStatusColumn: FC<Props> = ({
  offerId,
  assetInAmount,
  assetInDecimals,
  isPartiallyFillable,
}) => {
  const { amountInInitial, isLoading } = useInitialOtcOfferAmount(
    offerId,
    isPartiallyFillable,
  )

  if (isLoading) {
    return <Skeleton />
  }

  const amountInInitialBig = new Big(
    scaleHuman(amountInInitial, assetInDecimals),
  )

  if (!isPartiallyFillable || amountInInitialBig.lte(0)) {
    return (
      <Text fw={500} fs={13} lh={1} align="center">
        N / A
      </Text>
    )
  }

  const filled = amountInInitialBig.minus(assetInAmount)
  const filledPct = filled.div(amountInInitialBig).mul(100).toNumber()

  return (
    <ProgressBar
      size="small"
      value={filledPct}
      format={(percentage) => `${Math.floor(percentage).toString()}%`}
    />
  )
}
