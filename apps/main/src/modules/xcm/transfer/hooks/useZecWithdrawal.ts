import { useTranslation } from "react-i18next"

import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  ZcashRoute,
  ZcashTransferKind,
} from "@/modules/xcm/transfer/utils/zcash"

/**
 * Form alerts of a withdrawal paying a 1Click deposit address on NEAR: the
 * claim it waits for there.
 */
export const useZecWithdrawalAlerts = (
  zcashRoute: ZcashRoute | null,
): XcmAlert[] => {
  const { t } = useTranslation("xcm")
  if (zcashRoute?.kind !== ZcashTransferKind.Withdrawal) return []

  return [
    {
      key: "zecWithdrawal.claim",
      severity: "info",
      message: t("zecWithdrawal.alert.claim"),
    },
  ]
}
