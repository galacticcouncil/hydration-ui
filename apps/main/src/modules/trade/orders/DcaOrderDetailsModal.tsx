import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  Flex,
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

  return (
    <>
      <ModalHeader
        title={t("trade:trade.orders.dcaDetail.title")}
        align="center"
      />
      <ModalBody>
        <Flex justify="space-between" align="center" pb="xxl">
          <SwapAmount
            fromAmount={details.fromAmountBudget}
            from={details.from}
            to={details.to}
            showLogo
          />
          {details.status && <DcaOrderStatus status={details.status} />}
        </Flex>
        <ModalContentDivider />
        <Flex justify="space-between" py="xxl">
          <Flex direction="column" gap="s">
            <Text fs="p4" lh={1} color={getToken("text.low")}>
              {t("remaining")} / {t("budget")}
            </Text>
            <Text fw={500} fs="p4" lh={1} color={getToken("text.high")}>
              {t("number", {
                value:
                  details.status === DcaScheduleStatus.Created
                    ? details.fromAmountRemaining
                    : "0",
              })}
              /
              {t("number", {
                value: details.fromAmountBudget,
              })}{" "}
              {details.from.symbol}
            </Text>
          </Flex>
          <Separator orientation="vertical" />
          <Flex direction="column" gap="s" sx={{ justifySelf: "end" }}>
            <Text fs="p4" lh={1} color={getToken("text.low")}>
              {t("received")}
            </Text>
            <Text fw={500} fs="p4" lh={1} color={getToken("text.high")}>
              {t("currency", {
                value: details.toAmountExecuted ?? "0",
                symbol: details.to.symbol,
              })}
            </Text>
          </Flex>
        </Flex>
        <ModalContentDivider />
        <Flex justify="space-between" py="xxl">
          {blocksPeriod && (
            <>
              <Amount
                label={t("trade:trade.orders.dcaDetail.blockInterval")}
                value={t("trade:trade.orders.dcaDetail.schedulePeriod", {
                  timeframe: blocksPeriod
                    .times(PARACHAIN_BLOCK_TIME)
                    .toString(),
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
        </Flex>
        <ModalContentDivider />
        {details.status === DcaScheduleStatus.Created && onTerminate && (
          <Flex justify="flex-end" pt="l" pb="xxl">
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
        <ModalContentDivider />
      </ModalBody>
    </>
  )
}
