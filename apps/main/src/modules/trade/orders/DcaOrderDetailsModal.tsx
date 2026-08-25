import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { SquareArrowOutUpRight, Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  ExternalLink,
  Flex,
  Grid,
  Icon,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Separator,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { neckwork } from "@galacticcouncil/utils"
import Big from "big.js"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { useBlockTime } from "@/api/chain"
import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import {
  getDcaCompletionPercent,
  getDcaTradeProgress,
  useDcaFundingBalance,
} from "@/modules/trade/orders/lib/dcaProgress"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { DcaOrderProgress } from "@/modules/trade/orders/PastExecutions/DcaOrderProgress"

type Props = {
  readonly details: OrderData
  readonly onTerminate: (() => void) | null
  readonly pastExecutions: ReactNode
}

export const DcaOrderDetailsModal = ({
  details,
  onTerminate,
  pastExecutions,
}: Props) => {
  const { data: blockTimeMs, isLoading: isBlockTimeLoading } = useBlockTime()
  const { t } = useTranslation(["common", "trade"])
  const fundingBalance = useDcaFundingBalance(
    details.from,
    details.isOpenBudget,
  )

  const blocksPeriod = details.blocksPeriod ? Big(details.blocksPeriod) : null

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

  const isActive = details.status === DcaScheduleStatus.Created
  const progressPercent = isActive
    ? getDcaCompletionPercent({
        sold: details.fromAmountExecuted,
        total: details.fromAmountBudget,
        isOpenBudget: details.isOpenBudget,
        fundingBalance,
      })
    : null
  const tradeProgress = isActive
    ? getDcaTradeProgress({
        sold: details.fromAmountExecuted,
        total: details.fromAmountBudget,
        singleTradeSize: details.singleTradeSize,
        isOpenBudget: details.isOpenBudget,
        fundingBalance,
      })
    : null

  let tradesLabel: string | null = null
  if (tradeProgress !== null && tradeProgress.remaining > 0) {
    tradesLabel = t("trade:trade.orders.dcaDetail.tradesProgress", {
      executed: tradeProgress.executed,
      total: tradeProgress.executed + tradeProgress.remaining,
    })
  } else if (tradeProgress !== null) {
    tradesLabel = t("trade:trade.orders.dcaDetail.tradesCount", {
      count: tradeProgress.executed,
    })
  }

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
                value={
                  blockTimeMs !== undefined
                    ? t("trade:trade.orders.dcaDetail.schedulePeriod", {
                        timeframe: blocksPeriod.times(blockTimeMs).toNumber(),
                        count: blocksPeriod.toNumber(),
                      })
                    : "-"
                }
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
        {progressPercent !== null && (
          <>
            <ModalContentDivider />
            <Grid columnTemplate="1fr" gap="xxl" py="xl">
              <DcaOrderProgress
                percent={progressPercent}
                tradesLabel={tradesLabel}
              />
            </Grid>
          </>
        )}
        <ModalContentDivider />
        <Flex justify="space-between" gap="base" pt="l" pb="xl">
          <Button variant="tertiary" outline asChild>
            <ExternalLink href={neckwork.activityDca(details.scheduleId)}>
              <Icon component={SquareArrowOutUpRight} size="xs" />
              <Text fw={500} fs="p6" lh={1.4}>
                {t("openInExplorer")}
              </Text>
            </ExternalLink>
          </Button>
          {details.status === DcaScheduleStatus.Created && onTerminate && (
            <Button variant="danger" outline onClick={onTerminate}>
              <Icon component={Trash} size="s" />
              {t("trade:trade.cancelOrder.cta")}
            </Button>
          )}
        </Flex>
        <Flex
          direction="column"
          sx={{ marginInline: "var(--modal-content-inset)" }}
        >
          {pastExecutions}
        </Flex>
        <ModalContentDivider />
      </ModalBody>
    </>
  )
}
