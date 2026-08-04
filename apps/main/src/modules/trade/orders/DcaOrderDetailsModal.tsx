import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  Chip,
  Flex,
  Grid,
  Icon,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { useLimitFillStatus } from "@/modules/trade/orders/lib/useLimitFillStatus"
import {
  DcaOrderData,
  IntentDcaOrderData,
  isDcaScheduleOrder,
} from "@/modules/trade/orders/lib/useOrdersData"
import { PastExecutions } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

type Props = {
  readonly details: DcaOrderData | IntentDcaOrderData
  readonly onTerminate: (() => void) | null
}

export const DcaOrderDetailsModal = ({ details, onTerminate }: Props) => {
  const { t } = useTranslation(["common", "trade"])

  const blocksPeriod = details.blocksPeriod ? Big(details.blocksPeriod) : null

  // For a limit TWAP, the same fill rule as a plain limit order applies — just
  // per slice: a slice executes when the market pays at least the asked rate
  // (receive per sell). Disabled for market TWAPs (no limitPrice).
  const { orderRate, marketRate, distancePct, fillable } = useLimitFillStatus({
    from: details.from,
    to: details.to,
    sellAmount: details.limitPrice ? details.singleTradeSize : null,
    receiveAmount: details.limitPrice ? details.toAmountExecuted : null,
  })

  const spentOrBudgetLabel = details.isOpenBudget
    ? t("spent")
    : `${t("remaining")} / ${t("budget")}`

  const spentOrBudgetValue = details.isOpenBudget
    ? `${t("number", {
        value: details.fromAmountExecuted,
      })} ${details.from.symbol}`
    : `${t("number", {
        value:
          details.status === DcaScheduleStatus.Completed
            ? "0"
            : (details.fromAmountRemaining ?? details.fromAmountBudget),
      })}/${t("number", {
        value: details.fromAmountBudget,
      })} ${details.from.symbol}`

  const receivedValue = t("currency", {
    value: details.toAmountExecuted ?? "0",
    symbol: details.to.symbol,
  })

  return (
    <>
      <ModalHeader
        title={t("trade:trade.orders.dcaDetail.title")}
        align="center"
      />
      <ModalBody scrollable={false}>
        <Flex justify="space-between" align="center" pb="xl">
          <SwapAmount
            fromAmount={
              details.isOpenBudget
                ? details.fromAmountExecuted
                : details.fromAmountBudget
            }
            toAmount={
              details.isOpenBudget ? details.toAmountExecuted : undefined
            }
            from={details.from}
            to={details.to}
            showLogo
          />
          {details.status && <DcaOrderStatus status={details.status} />}
        </Flex>
        <ModalContentDivider />
        <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
          <Amount label={spentOrBudgetLabel} value={spentOrBudgetValue} />
          <Separator orientation="vertical" />
          <Amount label={t("received")} value={receivedValue} />
        </Grid>
        <ModalContentDivider />
        <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
          {blocksPeriod && (
            <>
              <Amount
                label={t("trade:trade.orders.dcaDetail.blockInterval")}
                value={t("trade:trade.orders.dcaDetail.schedulePeriod", {
                  timeframe: blocksPeriod
                    .times(PARACHAIN_BLOCK_TIME)
                    .toNumber(),
                  count: blocksPeriod.toNumber(),
                })}
              />
              <Separator orientation="vertical" />
            </>
          )}
          <Amount
            label={t("trade:trade.orders.dcaDetail.singleTradeSize")}
            value={t("currency", {
              value: details.singleTradeSize,
              symbol: details.from.symbol,
            })}
          />
        </Grid>
        {details.limitPrice && (
          <>
            <ModalContentDivider />
            <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
              <Amount
                label={t("trade:trade.orders.dcaDetail.limitPrice")}
                value={
                  orderRate
                    ? `${t("number", { value: orderRate })} ${details.to.symbol} / ${details.from.symbol}`
                    : "-"
                }
              />
              <Separator orientation="vertical" />
              <Amount
                label={t("trade:trade.orders.limit.marketPrice")}
                value={
                  marketRate
                    ? `${t("number", { value: marketRate })} ${details.to.symbol} / ${details.from.symbol}`
                    : "-"
                }
              />
            </Grid>
            {orderRate && (
              <>
                <ModalContentDivider />
                <Flex direction="column" gap="s" py="xl" align="flex-start">
                  <Text fs="p5" color={getToken("text.high")}>
                    {t("trade:trade.orders.limit.fillsWhen", {
                      fromSymbol: details.from.symbol,
                      rate: t("number", { value: orderRate }),
                      toSymbol: details.to.symbol,
                    })}
                  </Text>
                  {distancePct !== null &&
                    (fillable ? (
                      <Chip variant="green" size="small">
                        {t("trade:trade.orders.limit.fillableNow")}
                      </Chip>
                    ) : (
                      <Chip variant="secondary" size="small">
                        {t("trade:trade.orders.limit.away", {
                          pct: Math.abs(distancePct).toFixed(2),
                        })}
                      </Chip>
                    ))}
                </Flex>
              </>
            )}
          </>
        )}
        <ModalContentDivider />
        {details.status === DcaScheduleStatus.Created && onTerminate && (
          <Flex justify="flex-end" pt="l" pb="xl">
            <Button variant="danger" outline onClick={onTerminate}>
              <Icon component={Trash} size="s" />
              {t("trade:trade.cancelOrder.cta")}
            </Button>
          </Flex>
        )}
        {isDcaScheduleOrder(details) && (
          <PastExecutions
            scheduleId={details.scheduleId}
            sx={{ marginInline: "var(--modal-content-inset)" }}
          />
        )}
      </ModalBody>
    </>
  )
}
