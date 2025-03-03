import { ProgressBar, Skeleton, Text } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"

import { useOrdersStateQuery } from "@/codegen/__generated__/indexer"
import { scaleHuman } from "@/utils/formatting"

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
  const { data, loading } = useOrdersStateQuery({
    variables: {
      offerId: Number(offerId),
    },
    skip: !offerId || !isPartiallyFillable,
  })

  if (loading) {
    return <Skeleton />
  }

  const amountInInitial = scaleHuman(
    data?.events[0]?.args?.amountIn ?? "0",
    assetInDecimals,
  )

  const amountInInitialBig = new Big(amountInInitial)

  if (!isPartiallyFillable || amountInInitialBig.lte(0)) {
    return (
      <Text fw={500} fs={13} lh={1} align="center">
        N / A
      </Text>
    )
  }

  const filled = amountInInitialBig.minus(assetInAmount)
  const filledPct = filled.div(amountInInitial).mul(100).toNumber()

  return (
    <ProgressBar
      size="small"
      value={filledPct}
      format={(percentage) => `${Math.floor(percentage).toString()}%`}
    />
  )
}
