import { valueToBigNumber } from "@aave/math-utils"

import { Box, useMediaQuery, useTheme } from "@mui/material"
import { BigNumber } from "bignumber.js"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { TextWithTooltip } from "sections/lending/components/TextWithTooltip"
import { TopInfoPanelItem } from "sections/lending/components/TopInfoPanel/TopInfoPanelItem"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export const GhoReserveTopDetails = ({
  reserve,
}: {
  reserve: ComputedReserveData
}) => {
  const { ghoLoadingData } = useAppDataContext()

  const loading = ghoLoadingData
  const theme = useTheme()
  const downToSM = useMediaQuery(theme.breakpoints.down("sm"))

  const valueTypographyVariant = downToSM ? "main16" : "main21"
  const symbolsTypographyVariant = downToSM ? "secondary16" : "secondary21"

  const totalBorrowed = BigNumber.min(
    valueToBigNumber(reserve.totalDebt),
    valueToBigNumber(reserve.borrowCap),
  ).toNumber()

  return (
    <>
      <TopInfoPanelItem title="Total borrowed" loading={loading} hideIcon>
        <FormattedNumber
          value={totalBorrowed}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem title="Available to borrow" loading={loading} hideIcon>
        <FormattedNumber
          value={reserve.borrowCap}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        title={
          <TextWithTooltip text={<span>Price</span>}>
            <span>
              The Aave Protocol is programmed to always use the price of 1 GHO =
              $1. This is different from using market pricing via oracles for
              other crypto assets. This creates stabilizing arbitrage
              opportunities when the price of GHO fluctuates.
            </span>
          </TextWithTooltip>
        }
        loading={loading}
        hideIcon
      >
        <Box sx={{ display: "inline-flex", alignItems: "center" }}>
          <FormattedNumber
            value={1}
            symbol="USD"
            variant={valueTypographyVariant}
            symbolsVariant={symbolsTypographyVariant}
            symbolsColor="#A5A8B6"
          />
        </Box>
      </TopInfoPanelItem>
    </>
  )
}
