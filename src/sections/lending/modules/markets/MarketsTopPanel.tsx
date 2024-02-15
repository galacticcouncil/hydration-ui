import { valueToBigNumber } from "@aave/math-utils"

import { useMediaQuery, useTheme } from "@mui/material"

import { marketContainerProps } from "sections/lending/styles"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { TopInfoPanel } from "sections/lending/components/TopInfoPanel/TopInfoPanel"
import { TopInfoPanelItem } from "sections/lending/components/TopInfoPanel/TopInfoPanelItem"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export const MarketsTopPanel = () => {
  const { reserves, loading } = useAppDataContext()

  const theme = useTheme()
  const downToSM = useMediaQuery(theme.breakpoints.down("sm"))

  const aggregatedStats = reserves.reduce(
    (acc, reserve) => {
      return {
        totalLiquidity: acc.totalLiquidity.plus(reserve.totalLiquidityUSD),
        totalDebt: acc.totalDebt.plus(reserve.totalDebtUSD),
      }
    },
    {
      totalLiquidity: valueToBigNumber(0),
      totalDebt: valueToBigNumber(0),
    },
  )

  const valueTypographyVariant = downToSM ? "main16" : "main21"
  const symbolsVariant = downToSM ? "secondary16" : "secondary21"

  return (
    <TopInfoPanel
      containerProps={marketContainerProps}
      pageTitle={<span>Markets</span>}
      withMarketSwitcher
    >
      <TopInfoPanelItem hideIcon title="Total market size" loading={loading}>
        <FormattedNumber
          value={aggregatedStats.totalLiquidity.toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor="#A5A8B6"
          symbolsVariant={symbolsVariant}
        />
      </TopInfoPanelItem>
      <TopInfoPanelItem hideIcon title="Total available" loading={loading}>
        <FormattedNumber
          value={aggregatedStats.totalLiquidity
            .minus(aggregatedStats.totalDebt)
            .toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor="#A5A8B6"
          symbolsVariant={symbolsVariant}
        />
      </TopInfoPanelItem>
      <TopInfoPanelItem hideIcon title="Total borrows" loading={loading}>
        <FormattedNumber
          value={aggregatedStats.totalDebt.toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor="#A5A8B6"
          symbolsVariant={symbolsVariant}
        />
      </TopInfoPanelItem>
    </TopInfoPanel>
  )
}
