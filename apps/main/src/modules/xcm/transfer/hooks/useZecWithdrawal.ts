import { AssetRoute } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { isOneClickRoute } from "@/modules/xcm/transfer/utils/bridge"

/**
 * Form alerts of a withdrawal paying a 1Click deposit address on NEAR: the
 * claim it waits for there, and the refund account it can't build without.
 */
export const useZecWithdrawalAlerts = (
  route: AssetRoute | null,
  isMissingRefundAccount: boolean,
): XcmAlert[] => {
  const { t } = useTranslation("xcm")
  if (!isOneClickRoute(route)) return []

  return [
    {
      key: "zecWithdrawal.claim",
      severity: "info",
      message: t("zecWithdrawal.alert.claim"),
    },
    ...(isMissingRefundAccount
      ? [
          {
            key: "zecWithdrawal.nearAccount",
            severity: "error" as const,
            message: t("zecWithdrawal.alert.nearAccount"),
          },
        ]
      : []),
  ]
}
