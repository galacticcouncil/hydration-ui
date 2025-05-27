import {
  ComputedReserveData,
  useAssetCaps,
  useProtocolDataContext,
} from "@galacticcouncil/money-market/hooks"
import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { EModeInfo } from "@/modules/borrow/reserve/components/EModeInfo"
import { InterestRateModelChart } from "@/modules/borrow/reserve/components/InterestRateModelChart"
import { SupplyInfo } from "@/modules/borrow/reserve/components/SupplyInfo"

type ReserveConfigurationProps = {
  reserve: ComputedReserveData
}

export const ReserveSectionDivider = () => (
  <div
    sx={{
      bg: getToken("surfaces.themeBasePalette.background"),
      height: 4,
      mx: -20,
      my: [20, 40],
    }}
  />
)

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({
  reserve,
}) => {
  const { t } = useTranslation(["common", "borrow"])

  const { currentMarketData } = useProtocolDataContext()
  const { supplyCap, debtCeiling, borrowCap } = useAssetCaps()

  const showSupplyCapStatus = reserve.supplyCap !== "0"
  const showBorrowCapStatus = reserve.borrowCap !== "0"

  const shouldRenderBorrowInfo =
    reserve.borrowingEnabled || Number(reserve.totalDebt) > 0

  const shouldRenderEModeInfo = reserve.eModeCategoryId !== 0

  return (
    <>
      <Text fs="p3" fw={500} sx={{ mb: 30 }}>
        Supply info
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

      {/* <ReserveSectionDivider />

      <Text fs="p3" fw={500} sx={{ mb: 30 }}>
        Borrow info
      </Text> */}

      <ReserveSectionDivider />

      <Text fs="p3" fw={500} sx={{ mb: 30 }}>
        Interest rate model
      </Text>

      <InterestRateModelChart
        reserve={{
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
        }}
      />

      {shouldRenderEModeInfo && (
        <>
          <ReserveSectionDivider />
          <Text fs="p3" fw={500} sx={{ mb: 30 }}>
            E-Mode info
          </Text>
          <EModeInfo reserve={reserve} />
        </>
      )}

      {/*  {shouldRenderBorrowInfo && (
        <>
          <ReserveSectionDivider />
          <Text color="pink500" fs={14} sx={{ mb: 30 }}>
            Borrow info
          </Text>
          <BorrowInfo
            reserve={reserve}
            currentMarketData={currentMarketData}
            currentNetworkConfig={currentNetworkConfig}
            renderCharts={renderCharts}
            showBorrowCapStatus={showBorrowCapStatus}
            borrowCap={borrowCap}
          />
          <ReserveSectionDivider />
          <Text color="brightBlue700" fs={14} sx={{ mb: 30 }}>
            Interest rate model
          </Text>
          <InterestRateModelInfo
            reserve={reserve}
            currentNetworkConfig={currentNetworkConfig}
          />
        </>
      )}

      {shouldRenderEModeInfo && (
        <>
          <ReserveSectionDivider />
          <Text fs={14} sx={{ mb: 30 }}>
            E-Mode info
          </Text>
          <EModeInfo reserve={reserve} />
        </>
      )} */}
    </>
  )
}
