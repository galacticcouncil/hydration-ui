import { EventName } from "sections/lending/subsections/transactions/types"
import { useTranslation } from "react-i18next"
import { useCallback } from "react"

export const useFormatEventName = () => {
  const { t } = useTranslation()

  return useCallback(
    (name: EventName): string => {
      switch (name) {
        case "ReserveUsedAsCollateralEnabled":
        case "ReserveUsedAsCollateralDisabled":
          return t("lending.transactions.event.collateral")
        case "LiquidationCall":
          return t("lending.transactions.event.liquidation")
        default:
          return name
      }
    },
    [t],
  )
}
