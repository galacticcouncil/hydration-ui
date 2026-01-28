import {
  ComputedReserveData,
  getBorrowCapData,
  useMoneyMarketData,
} from "@galacticcouncil/money-market/hooks"
import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { EModeInfo } from "@/modules/borrow/reserve/components/EModeInfo"
import { HollarBorrowInfo } from "@/modules/borrow/reserve/components/HollarBorrowInfo"
import { ReserveSectionDivider } from "@/modules/borrow/reserve/components/ReserveSectionDivider"

export type HollarReserveConfigurationProps = {
  reserve: ComputedReserveData
}

export const HollarReserveConfiguration: React.FC<
  HollarReserveConfigurationProps
> = ({ reserve }) => {
  const { t } = useTranslation(["borrow"])
  const { ghoReserveData } = useMoneyMarketData()

  const shouldRenderEModeInfo = reserve.eModeCategoryId !== 0

  const totalDebt = Big(reserve.totalDebt)
  const totalDebtUSD = Big(reserve.totalDebtUSD)
  const totalBorrowed = Big.min(totalDebt, reserve.borrowCap)
  const totalBorrowedUSD = Big.min(totalDebtUSD, reserve.borrowCapUSD)

  const maxAvailableToBorrow = Big.max(reserve.borrowCap, 0)
  const maxAvailableToBorrowUSD = Big.max(reserve.borrowCapUSD, 0)

  const { borrowCapUsage } = getBorrowCapData(reserve)

  return (
    <>
      <Text fs="p3" fw={500} mb="xl">
        {t("reserve.hollar.title")}
      </Text>
      <Text fs="p4" color={getToken("text.medium")}>
        {t("reserve.hollar.description")}
      </Text>
      <ReserveSectionDivider />
      <Text fs="p3" fw={500}>
        {t("reserve.borrowInfo")}
      </Text>
      <HollarBorrowInfo
        reserve={reserve}
        ghoReserveData={ghoReserveData}
        totalBorrowed={totalBorrowed.toString()}
        totalBorrowedUSD={totalBorrowedUSD.toString()}
        maxAvailableToBorrow={maxAvailableToBorrow.toString()}
        maxAvailableToBorrowUSD={maxAvailableToBorrowUSD.toString()}
        borrowCapUsage={borrowCapUsage}
      />
      {shouldRenderEModeInfo && (
        <>
          <ReserveSectionDivider />
          <Text fs="p3" fw={500} sx={{ mb: 30 }}>
            {t("reserve.emodeInfo")}
          </Text>
          <EModeInfo reserve={reserve} />
        </>
      )}
    </>
  )
}
