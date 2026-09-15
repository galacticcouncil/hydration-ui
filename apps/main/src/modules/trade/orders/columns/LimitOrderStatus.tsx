import { Chip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { Status } from "@/modules/trade/orders/columns/SwapStatus"
import { IntentLimitOrderData } from "@/modules/trade/orders/lib/orderData"
import { useLimitFillStatus } from "@/modules/trade/orders/lib/useLimitFillStatus"

type ChipProps = {
  readonly distancePct: number
  readonly fillable: boolean
}

export const FillStatusChip: FC<ChipProps> = ({ distancePct, fillable }) => {
  const { t } = useTranslation("trade")

  return fillable ? (
    <Chip variant="green" size="small">
      {t("trade.orders.limit.fillableNow")}
    </Chip>
  ) : (
    <Chip variant="blue" size="small">
      {t("trade.orders.limit.away", { pct: Math.abs(distancePct) })}
    </Chip>
  )
}

type Props = {
  readonly order: IntentLimitOrderData
  readonly long?: boolean
}

export const LimitOrderStatus: FC<Props> = ({ order, long = false }) => {
  const { t } = useTranslation("trade")

  const { distancePct, fillable } = useLimitFillStatus({
    from: order.from,
    to: order.to,
    sellAmount: order.fromAmountBudget,
    receiveAmount: order.toAmountBudget,
  })

  if (long) {
    return distancePct === null ? null : (
      <FillStatusChip distancePct={distancePct} fillable={fillable} />
    )
  }

  return (
    <Status color={getToken("accents.success.emphasis")}>
      {distancePct === null ? (
        t("trade.orders.status.active")
      ) : fillable ? (
        t("trade.orders.limit.fillableNow")
      ) : (
        <Trans
          t={t}
          i18nKey="trade.orders.limit.activeAway"
          values={{ pct: Math.abs(distancePct) }}
        >
          <span sx={{ color: getToken("text.medium"), fontWeight: 400 }} />
        </Trans>
      )}
    </Status>
  )
}
