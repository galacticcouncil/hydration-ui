import { Text } from "components/Typography/Text/Text"
import React from "react"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { BorrowInfo } from "sections/lending/ui/reserve-overview/BorrowInfo"
import { EModeInfo } from "sections/lending/ui/reserve-overview/EModeInfo"
import { InterestRateModelInfo } from "sections/lending/ui/reserve-overview/InterestRateModelInfo"
import { ReserveSectionDivider } from "sections/lending/ui/reserve-overview/ReserveSectionDivider"
import { SupplyInfo } from "sections/lending/ui/reserve-overview/SupplyInfo"

type ReserveConfigurationProps = {
  reserve: ComputedReserveData
}

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({
  reserve,
}) => {
  const { currentNetworkConfig, currentMarketData } = useProtocolDataContext()

  const { supplyCap, debtCeiling, borrowCap } = useAssetCaps()
  const showSupplyCapStatus: boolean = reserve.supplyCap !== "0"
  const showBorrowCapStatus: boolean = reserve.borrowCap !== "0"

  const shouldRenderBorrowInfo =
    reserve.borrowingEnabled || Number(reserve.totalDebt) > 0

  const shouldRenderEModeInfo = reserve.eModeCategoryId !== 0

  return (
    <>
      <Text fs={15} font="Geist" sx={{ mb: 30 }}>
        Reserve status and configuration
      </Text>

      <Text color="brightBlue300" fs={14} sx={{ mb: 30 }}>
        Supply info
      </Text>
      <SupplyInfo
        reserve={reserve}
        currentMarketData={currentMarketData}
        showSupplyCapStatus={showSupplyCapStatus}
        supplyCap={supplyCap}
        debtCeiling={debtCeiling}
      />

      {shouldRenderBorrowInfo && (
        <>
          <ReserveSectionDivider />
          <Text color="pink500" fs={14} sx={{ mb: 30 }}>
            Borrow info
          </Text>
          <BorrowInfo
            reserve={reserve}
            currentMarketData={currentMarketData}
            currentNetworkConfig={currentNetworkConfig}
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
      )}
    </>
  )
}
