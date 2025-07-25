import { MoneyMarketEventName } from "@galacticcouncil/indexer/squid"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"

export const useFormatEventName = () => {
  const { t } = useTranslation(["borrow"])

  return useCallback(
    (name: MoneyMarketEventName): string => {
      switch (name) {
        case "ReserveUsedAsCollateralEnabled":
        case "ReserveUsedAsCollateralDisabled":
          return t("borrow:history.event.collateral")
        case "LiquidationCall":
          return t("borrow:history.event.liquidation")
        default:
          return name
      }
    },
    [t],
  )
}
