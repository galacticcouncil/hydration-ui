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
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { PastExecutions } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

type Props = {
  readonly details: OrderData
  readonly onTerminate: () => void
}

export const DcaOrderDetailsModal = ({ details, onTerminate }: Props) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <>
      <ModalHeader
        title={t("trade:trade.orders.dcaDetail.title")}
        align="center"
      />
      <ModalBody sx={{ overflowY: "hidden" }}>
        <Flex
          justify="space-between"
          align="center"
          pb={getTokenPx("containers.paddings.primary")}
        >
          <SwapAmount
            fromAmount={details.fromAmountBudget}
            from={details.from}
            to={details.to}
            showLogo
          />
          {details.status && <DcaOrderStatus status={details.status} />}
        </Flex>
        <ModalContentDivider />
        <Flex
          justify="space-between"
          py={getTokenPx("containers.paddings.primary")}
        >
          <Flex
            direction="column"
            gap={getTokenPx("containers.paddings.quint")}
          >
            <Text fs={13} lh={1} color={getToken("text.low")}>
              {t("remaining")} / {t("budget")}
            </Text>
            <Text fw={500} fs={13} lh={1} color={getToken("text.high")}>
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
          <Flex
            direction="column"
            gap={getTokenPx("containers.paddings.quint")}
            sx={{ justifySelf: "end" }}
          >
            <Text fs={13} lh={1} color={getToken("text.low")}>
              {t("received")}
            </Text>
            <Text fw={500} fs={13} lh={1} color={getToken("text.high")}>
              {t("currency", {
                value: details.toAmountExecuted ?? "0",
                symbol: details.to.symbol,
              })}
            </Text>
          </Flex>
        </Flex>
        <ModalContentDivider />
        <Flex
          justify="space-between"
          py={getTokenPx("containers.paddings.primary")}
        >
          {details.blocksPeriod && (
            <>
              <Amount
                label={t("trade:trade.orders.dcaDetail.blockInterval")}
                value={t("trade:trade.orders.dcaDetail.schedulePeriod", {
                  timeframe: details.blocksPeriod * PARACHAIN_BLOCK_TIME,
                  count: details.blocksPeriod,
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
        {details.status === DcaScheduleStatus.Created && (
          <Flex
            justify="flex-end"
            pt={getTokenPx("containers.paddings.secondary")}
            pb={getTokenPx("containers.paddings.primary")}
          >
            <Button variant="danger" outline onClick={onTerminate}>
              <Icon component={Trash} size={14} />
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
