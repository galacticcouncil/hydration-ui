import { Box, Skeleton } from "@mui/material"
import BigNumber from "bignumber.js"
import { GENERAL } from "sections/lending/utils/mixPanelEvents"

import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

interface PriceImpactTooltipProps extends TextWithTooltipProps {
  loading: boolean
  outputAmountUSD: string
  inputAmountUSD: string
}

export const PriceImpactTooltip = ({
  loading,
  outputAmountUSD,
  inputAmountUSD,
  ...rest
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

  return (
    <TextWithTooltip
      variant="secondary12"
      color="text.secondary"
      text={
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <span>
            Price impact{" "}
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={12}
                width={25}
                sx={{ borderRadius: "4px", display: "flex", marginLeft: "4px" }}
              />
            ) : (
              <FormattedNumber
                value={priceImpact}
                visibleDecimals={2}
                variant="secondary12"
                color="text.secondary"
                sx={{ marginLeft: "4px" }}
              />
            )}
            %
          </span>
        </Box>
      }
      {...rest}
    >
      <span>
        Price impact is the spread between the total value of the entry tokens
        switched and the destination tokens obtained (in USD), which results
        from the limited liquidity of the trading pair.
      </span>
    </TextWithTooltip>
  )
}
