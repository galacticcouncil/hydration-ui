import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useBasejumpPoolLiquidity } from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  isBasejumpPoolExceeded,
  XcmLimitAlertKey,
} from "@/modules/xcm/transfer/utils/limits"
import { XcmTag } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

export const useBasejumpPoolAlerts = (
  form: UseFormReturn<XcmFormValues>,
): XcmAlert[] => {
  const { t } = useTranslation(["xcm"])

  const [destChain, destAsset, destAmount, bridgeProvider] = form.watch([
    "destChain",
    "destAsset",
    "destAmount",
    "bridgeProvider",
  ])

  const isBasejump = bridgeProvider === XcmTag.Basejump

  const { data: pool } = useBasejumpPoolLiquidity(
    isBasejump ? destChain : null,
    isBasejump ? destAsset : null,
  )

  return useMemo<XcmAlert[]>(() => {
    if (!pool || !destChain || !destAsset) return []
    if (!isBasejumpPoolExceeded(bridgeProvider, destAmount, pool)) return []

    return [
      {
        key: XcmLimitAlertKey.BasejumpPoolExceeded,
        title: t("limit.basejumpPool"),
        message:
          pool.available === 0n
            ? t("limit.alert.basejump.poolEmpty")
            : t("limit.alert.basejump.poolExceeded", {
                capacity: toDecimal(pool.available, pool.decimals),
                symbol: destAsset.originSymbol,
              }),
        severity: "error",
      },
    ]
  }, [bridgeProvider, destAmount, destAsset, destChain, pool, t])
}
