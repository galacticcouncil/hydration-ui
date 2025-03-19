import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { BorrowInfo } from "sections/lending/ui/reserve-overview/BorrowInfo"
import { EModeInfo } from "sections/lending/ui/reserve-overview/EModeInfo"
import { GhoDiscountParameters } from "sections/lending/ui/reserve-overview/gho/GhoDiscountCalculator"
import { ReserveSectionDivider } from "sections/lending/ui/reserve-overview/ReserveSectionDivider"

export type GhoReserveConfigurationProps = {
  reserve: ComputedReserveData
}

export const GhoReserveConfiguration: React.FC<
  GhoReserveConfigurationProps
> = ({ reserve }) => {
  const { t } = useTranslation()
  const { currentNetworkConfig, currentMarketData } = useProtocolDataContext()
  const { ghoLoadingData, ghoReserveData } = useAppDataContext()

  const renderCharts =
    !!currentNetworkConfig.ratesHistoryApiUrl &&
    !currentMarketData.disableCharts

  const { borrowCap } = useAssetCaps()

  const showBorrowCapStatus: boolean = reserve.borrowCap !== "0"

  const shouldRenderEModeInfo = reserve.eModeCategoryId !== 0

  return (
    <>
      <>
        <Text fs={15} font="Geist" sx={{ mb: 30 }}>
          About HOLLAR
        </Text>
        <Text fs={14} color="basic400">
          {t("lending.hollar.banner.description")}
        </Text>
      </>
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
        collectorInfoHidden
      />

      {ghoReserveData.ghoDiscountRate > 0 && (
        <GhoDiscountParameters
          ghoReserveData={ghoReserveData}
          loading={ghoLoadingData}
        />
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
