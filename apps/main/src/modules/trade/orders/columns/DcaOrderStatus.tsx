import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { Box, Chip } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import {
  getDcaCompletionPercent,
  useDcaFundingBalance,
} from "@/modules/trade/orders/lib/dcaProgress"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly status: DcaScheduleStatus
  readonly isDcaSwap?: boolean
  readonly sold?: string | null
  readonly total?: string | null
  readonly isOpenBudget?: boolean
  readonly from?: TAsset
}

export const DcaOrderStatus: FC<Props> = ({
  status,
  isDcaSwap = false,
  sold,
  total,
  isOpenBudget = false,
  from,
}) => {
  const { t } = useTranslation("trade")
  const fundingBalance = useDcaFundingBalance(from, isOpenBudget)

  if (isDcaSwap) return <SwapStatus />

  switch (status) {
    case DcaScheduleStatus.Terminated:
      return (
        <Chip variant="orange" size="small">
          {t("trade.orders.status.terminated")}
        </Chip>
      )
    case DcaScheduleStatus.Cancelled:
      return (
        <Chip variant="red" size="small">
          {t("trade.orders.status.cancelled")}
        </Chip>
      )
    case DcaScheduleStatus.Created: {
      const percent = getDcaCompletionPercent({
        sold,
        total,
        isOpenBudget,
        fundingBalance,
      })

      return (
        <Chip variant="info" size="small">
          {t("trade.orders.status.active")}
          {percent !== null && <CompletionBar percent={percent} />}
          {percent !== null &&
            t("percent", {
              ns: "common",
              value: percent,
              maximumFractionDigits: 0,
            })}
        </Chip>
      )
    }
    case DcaScheduleStatus.Completed:
      return (
        <Chip variant="green" size="small">
          {t("trade.orders.status.completed")}
        </Chip>
      )
  }
}

const CompletionBar: FC<{ readonly percent: number }> = ({ percent }) => {
  const clipped = Math.min(100, Math.max(0, percent))

  return (
    <Box
      width="2.25rem"
      height="3xs"
      borderRadius="full"
      overflow="hidden"
      position="relative"
      flex="none"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clipped)}
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        sx={{ backgroundColor: "currentColor", opacity: 0.25 }}
      />
      <Box
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        width={`${clipped}%`}
        sx={{ backgroundColor: "currentColor" }}
      />
    </Box>
  )
}
