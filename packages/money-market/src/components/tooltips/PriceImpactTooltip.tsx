import { Flex, Skeleton, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { BigNumber } from "bignumber.js"

export type PriceImpactTooltipProps = {
  loading: boolean
  outputAmountUSD: string
  inputAmountUSD: string
}

export const PriceImpactTooltip = ({
  loading,
  outputAmountUSD,
  inputAmountUSD,
}: PriceImpactTooltipProps) => {
  const priceDifference: BigNumber = new BigNumber(outputAmountUSD).minus(
    inputAmountUSD,
  )
  let priceImpact =
    inputAmountUSD && inputAmountUSD !== "0"
      ? priceDifference.dividedBy(inputAmountUSD).times(100).toFixed(2)
      : "0"
  if (priceImpact === "-0.00") {
    priceImpact = "0.00"
  }

  const warning = Math.abs(Number(priceImpact)) > 10

  return (
    <Tooltip
      text={
        <>
          Price impact is the spread between the total value of the entry tokens
          switched and the destination tokens obtained (in USD), which results
          from the limited liquidity of the trading pair.
        </>
      }
    >
      <Flex align="center" gap="xs">
        <Text
          fs="p5"
          color={
            warning
              ? getToken("accents.alert.primary")
              : getToken("text.medium")
          }
        >
          Price impact
        </Text>
        {loading ? (
          <Skeleton width={25} height={12} />
        ) : (
          <Text
            fs="p5"
            color={
              warning
                ? getToken("accents.alert.primary")
                : getToken("text.medium")
            }
          >
            {priceImpact}%
          </Text>
        )}
      </Flex>
    </Tooltip>
  )
}
