import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  Flex,
  Grid,
  Icon,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Separator,
  Skeleton,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { Status } from "@/modules/trade/orders/columns/SwapStatus"
import { TradeOrderHistoryItem } from "@/modules/trade/orders/lib/tradeOrdersHistory.types"
import { useOrderTradesData } from "@/modules/trade/orders/lib/useOrderTradesData"
import { useTerminateDcaSchedule } from "@/modules/trade/orders/lib/useTerminateDcaSchedule"
import { useTradeOrderHistoryEnrichment } from "@/modules/trade/orders/lib/useTradeOrderHistoryEnrichment"
import { PastExecutionItem } from "@/modules/trade/orders/PastExecutions/PastExecutionItem"
import { PastExecutionsHeader } from "@/modules/trade/orders/PastExecutions/PastExecutionsHeader"
import { PastExecutionsListHeader } from "@/modules/trade/orders/PastExecutions/PastExecutionsListHeader"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

type Props = {
  readonly details: TradeOrderHistoryItem
  readonly onClose: () => void
}

export const TradeOrderHistoryDetailsModal = ({ details, onClose }: Props) => {
  const { t } = useTranslation(["common", "trade"])

  const terminateDcaSchedule = useTerminateDcaSchedule()

  const { from, to, isOpenBudget } = details

  const { executions, isLoading: isExecutionsLoading } = useOrderTradesData(
    details.id,
    from,
    to,
  )
  const {
    remaining,
    received,
    spent,
    isLoading: isEnrichmentLoading,
  } = useTradeOrderHistoryEnrichment(details.id, from, to)

  const blocksPeriod = details.intervalBlocks
    ? Big(details.intervalBlocks)
    : null

  const spentOrBudgetLabel = isOpenBudget
    ? t("spent")
    : `${t("remaining")} / ${t("budget")}`

  const spentOrBudgetValue = isOpenBudget
    ? `${t("number", { value: spent })} ${from.symbol}`
    : `${t("number", { value: remaining })}/${t("number", {
        value: details.totalBudget,
      })} ${from.symbol}`

  const receivedValue = t("currency", {
    value: received,
    symbol: to.symbol,
  })

  return (
    <>
      <ModalHeader
        title={t("trade:trade.orders.dcaDetail.title")}
        align="center"
      />
      <ModalBody scrollable={false}>
        <Flex justify="space-between" align="center" pb="xl">
          {isOpenBudget && isEnrichmentLoading ? (
            <Skeleton width={140} height={20} />
          ) : (
            <SwapAmount
              fromAmount={isOpenBudget ? spent : details.totalBudget}
              toAmount={isOpenBudget ? received : undefined}
              from={from}
              to={to}
              showLogo
            />
          )}
          {details.status === null ? (
            <Status color={getToken("accents.success.emphasis")}>
              {t("trade:trade.orders.status.active")}
            </Status>
          ) : (
            <DcaOrderStatus
              status={
                details.status.type === "Terminated"
                  ? DcaScheduleStatus.Terminated
                  : DcaScheduleStatus.Completed
              }
            />
          )}
        </Flex>
        <ModalContentDivider />
        <Grid columnTemplate="1fr 1px 1fr" gap="xl" py="xl">
          <>
            <Amount
              label={spentOrBudgetLabel}
              value={isEnrichmentLoading ? "-" : spentOrBudgetValue}
            />
            <Separator orientation="vertical" />
            <Amount
              label={t("received")}
              value={isEnrichmentLoading ? "-" : receivedValue}
            />
          </>
        </Grid>
        <ModalContentDivider />
        <Grid columnTemplate="1fr 1px 1fr" gap="xl" py="xl">
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
              value: details.amount,
              symbol: from.symbol,
            })}
          />
        </Grid>
        <ModalContentDivider />
        {details.status === null && (
          <Flex justify="flex-end" pt="l" pb="xl">
            <Button
              variant="danger"
              outline
              onClick={() => {
                terminateDcaSchedule.mutate(details.id)
                onClose()
              }}
            >
              <Icon component={Trash} size="s" />
              {t("trade:trade.cancelOrder.cta")}
            </Button>
          </Flex>
        )}
        <Flex
          direction="column"
          bg={getToken("surfaces.containers.dim.dimOnBg")}
          sx={{ marginInline: "var(--modal-content-inset)" }}
        >
          <PastExecutionsHeader />
          <Flex direction="column" gap="s">
            <PastExecutionsListHeader />
            <Separator />
            {isExecutionsLoading || isEnrichmentLoading ? (
              <Flex gap="xl" px="l" py="xxl">
                <Skeleton sx={{ flex: 1 }} />
                <Skeleton sx={{ flex: 1 }} />
              </Flex>
            ) : executions.length === 0 ? (
              <Flex justify="center" px="l" py="xxl">
                <Text fs="p5" lh={1.4} color={getToken("text.low")}>
                  {t("trade:trade.orders.pastExecutions.empty")}
                </Text>
              </Flex>
            ) : (
              <VirtualizedList
                items={executions}
                maxVisibleItems={5}
                itemSize={65}
                separated
                renderItem={(execution) => (
                  <PastExecutionItem
                    assetIn={from}
                    assetOut={to}
                    execution={execution}
                  />
                )}
              />
            )}
          </Flex>
        </Flex>
        <ModalContentDivider />
      </ModalBody>
    </>
  )
}
