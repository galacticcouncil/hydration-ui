import { ProgressBar, Skeleton } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"

import { useOrdersStateQuery } from "@/codegen/__generated__"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly offerId: string | undefined
  readonly assetInAmount: string
  readonly assetInDp: number | undefined
  readonly isPartiallyFillable: boolean
}

export const OfferStatusColumn: FC<Props> = ({
  offerId,
  assetInAmount,
  assetInDp,
  isPartiallyFillable,
}) => {
  const offerIdNumber = Number(offerId)

  const { data, loading } = useOrdersStateQuery({
    variables: {
      offerId: offerIdNumber,
    },
    skip: !offerIdNumber || !isPartiallyFillable,
  })

  if (loading) {
    return <Skeleton />
  }

  const amountInInitial = scaleHuman(
    data?.events[0]?.args?.amountIn ?? "0",
    assetInDp ?? 12,
  )

  if (!isPartiallyFillable || !new Big(amountInInitial).gt(0)) {
    return "N / A"
  }

  const filled = new Big(amountInInitial).minus(assetInAmount)
  const filledPct = filled.div(amountInInitial).mul(100).toNumber()

  return (
    <ProgressBar
      size="small"
      value={filledPct}
      format={(percentage) => `${Math.floor(percentage).toString()}%`}
    />
  )
}
