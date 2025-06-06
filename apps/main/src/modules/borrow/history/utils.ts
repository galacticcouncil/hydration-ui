import { useCallback } from "react"
import { useTranslation } from "react-i18next"

import { EventName } from "@/modules/borrow/history/types"

export const useFormatEventName = () => {
  const { t } = useTranslation(["borrow"])

  return useCallback(
    (name: EventName): string => {
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
