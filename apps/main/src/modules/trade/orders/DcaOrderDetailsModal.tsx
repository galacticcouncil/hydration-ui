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
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { PastExecutions } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

type Props = {
  readonly details: OrderData
  readonly onTerminate: (() => void) | null
}

export const DcaOrderDetailsModal = ({ details, onTerminate }: Props) => {
  const { t } = useTranslation(["common", "trade"])

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
        <ModalContentDivider />
        {details.status === DcaScheduleStatus.Created && onTerminate && (
          <Flex justify="flex-end" pt="l" pb="xl">
            <Button variant="danger" outline onClick={onTerminate}>
              <Icon component={Trash} size="s" />
              {t("trade:trade.cancelOrder.cta")}
            </Button>
          </Flex>
        )}
        <PastExecutions
          scheduleId={details.scheduleId}
          sx={{ marginInline: "var(--modal-content-inset)" }}
        />
      </ModalBody>
    </>
  )
}
