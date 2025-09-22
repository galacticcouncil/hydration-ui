import { valueToBigNumber } from "@aave/math-utils"
import BN from "bignumber.js"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getBorrowCapData } from "sections/lending/hooks/useAssetCaps"
import { EModeInfo } from "sections/lending/ui/reserve-overview/EModeInfo"
import { GhoBorrowInfo } from "sections/lending/ui/reserve-overview/gho/GhoBorrowInfo"
import { GhoDiscountParameters } from "sections/lending/ui/reserve-overview/gho/GhoDiscountCalculator"
import { ReserveSectionDivider } from "sections/lending/ui/reserve-overview/ReserveSectionDivider"

export type GhoReserveConfigurationProps = {
  reserve: ComputedReserveData
}

export const GhoReserveConfiguration: React.FC<
  GhoReserveConfigurationProps
> = ({ reserve }) => {
  const { t } = useTranslation()
  const { ghoLoadingData, ghoReserveData } = useAppDataContext()

  const shouldRenderEModeInfo = reserve.eModeCategoryId !== 0

  const totalBorrowed = BN.min(
    valueToBigNumber(reserve.totalDebt),
    valueToBigNumber(reserve.borrowCap),
  ).toNumber()

  const totalBorrowedUSD = BN.min(
    valueToBigNumber(reserve.totalDebtUSD),
    valueToBigNumber(reserve.borrowCapUSD),
  ).toString()

  const maxAvailableToBorrow = BN.max(
    valueToBigNumber(reserve.borrowCap),
    0,
  ).toNumber()

  const maxAvailableToBorrowUSD = BN.max(
    valueToBigNumber(reserve.borrowCapUSD),
    0,
  ).toNumber()

  const borrowCapUsage = getBorrowCapData(reserve).borrowCapUsage

  return (
    <>
      <Text fs={15} font="Geist" sx={{ mb: 30 }}>
        {t("lending.hollar.reserve.title")}
      </Text>
      <Text fs={14} color="basic400">
        {t("lending.hollar.reserve.description")}
      </Text>
      <ReserveSectionDivider />
      <Text color="pink500" fs={14} sx={{ mb: 30 }}>
        Borrow info
      </Text>
      <GhoBorrowInfo
        reserve={reserve}
        ghoReserveData={ghoReserveData}
        totalBorrowed={totalBorrowed}
        totalBorrowedUSD={totalBorrowedUSD}
        maxAvailableToBorrow={maxAvailableToBorrow}
        maxAvailableToBorrowUSD={maxAvailableToBorrowUSD}
        borrowCapUsage={borrowCapUsage}
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
