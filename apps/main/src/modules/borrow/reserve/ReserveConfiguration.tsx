import {
  ComputedReserveData,
  useAssetCaps,
  useProtocolDataContext,
} from "@galacticcouncil/money-market/hooks"
import { Box, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { BorrowInfo } from "@/modules/borrow/reserve/components/BorrowInfo"
import { EModeInfo } from "@/modules/borrow/reserve/components/EModeInfo"
import { InterestRateModelChart } from "@/modules/borrow/reserve/components/InterestRateModelChart"
import { SupplyInfo } from "@/modules/borrow/reserve/components/SupplyInfo"

type ReserveConfigurationProps = {
  reserve: ComputedReserveData
}

export const ReserveSectionDivider = () => (
  <Box
    bg={getToken("surfaces.themeBasePalette.background")}
    height={4}
    mx={-20}
    my={[20, 40]}
  />
)

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({
  reserve,
}) => {
  const { t } = useTranslation(["borrow"])
  const { currentMarketData } = useProtocolDataContext()
  const { supplyCap, debtCeiling, borrowCap } = useAssetCaps()

  const showSupplyCapStatus = reserve.supplyCap !== "0"
  const showBorrowCapStatus = reserve.borrowCap !== "0"

  const shouldRenderBorrowInfo =
    reserve.borrowingEnabled || Number(reserve.totalDebt) > 0

  const shouldRenderEModeInfo = reserve.eModeCategoryId !== 0

  const interestRateChartConfig = useMemo(
    () => ({
      baseStableBorrowRate: reserve.baseStableBorrowRate,
      baseVariableBorrowRate: reserve.baseVariableBorrowRate,
      optimalUsageRatio: reserve.optimalUsageRatio,
      stableRateSlope1: reserve.stableRateSlope1,
      stableRateSlope2: reserve.stableRateSlope2,
      utilizationRate: reserve.borrowUsageRatio,
      variableRateSlope1: reserve.variableRateSlope1,
      variableRateSlope2: reserve.variableRateSlope2,
      stableBorrowRateEnabled: reserve.stableBorrowRateEnabled,
      totalLiquidityUSD: reserve.totalLiquidityUSD,
      totalDebtUSD: reserve.totalDebtUSD,
    }),
    [reserve],
  )

  return (
    <>
      <Text fs="p3" fw={500} sx={{ mb: 30 }}>
        {t("borrow:reserve.supplyInfo")}
      </Text>
      {supplyCap && (
        <SupplyInfo
          reserve={reserve}
          currentMarketData={currentMarketData}
          showSupplyCapStatus={showSupplyCapStatus}
          supplyCap={supplyCap}
          debtCeiling={debtCeiling}
        />
      )}

      {shouldRenderBorrowInfo && (
        <>
          <ReserveSectionDivider />
          <Text fs="p3" fw={500} sx={{ mb: 30 }}>
            {t("borrow:reserve.borrowInfo")}
          </Text>
          <BorrowInfo
            reserve={reserve}
            currentMarketData={currentMarketData}
            showBorrowCapStatus={showBorrowCapStatus}
            borrowCap={borrowCap}
          />
          <ReserveSectionDivider />
          <Text fs="p3" fw={500} sx={{ mb: 30 }}>
            {t("borrow:reserve.interestRateModel")}
          </Text>

          <InterestRateModelChart config={interestRateChartConfig} />
        </>
      )}

      {shouldRenderEModeInfo && (
        <>
          <ReserveSectionDivider />
          <Text fs="p3" fw={500} sx={{ mb: 30 }}>
            {t("borrow:reserve.emodeInfo")}
          </Text>
          <EModeInfo reserve={reserve} />
        </>
      )}
    </>
  )
}
