import {
  Flex,
  SummaryRow,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import type { AssetDepositLimit } from "@galacticcouncil/xc-cfg/build/clients/chain/hydration/circuit-breaker"
import { useTranslation } from "react-i18next"

import { DepositLimitInfo } from "@/modules/xcm/transfer/components/LimitSummary/DepositLimitInfo"
import { toDecimal } from "@/utils/formatting"

type DepositLimitSummaryRowProps = {
  depositLimit: AssetDepositLimit
  loading?: boolean
}

export const DepositLimitSummaryRow = ({
  depositLimit,
  loading,
}: DepositLimitSummaryRowProps) => {
  const { t } = useTranslation(["common", "xcm"])

  return (
    <SummaryRow
      label={t("xcm:summary.depositLimit")}
      loading={loading}
      content={
        <Tooltip
          text={<DepositLimitInfo depositLimit={depositLimit} />}
          asChild
        >
          <Flex align="center" gap="xs">
            {t("currency", {
              value: toDecimal(
                depositLimit.headroom ?? 0n,
                depositLimit.decimals,
              ),
              symbol: depositLimit.symbol,
            })}
            <TooltipIcon />
          </Flex>
        </Tooltip>
      }
    />
  )
}
