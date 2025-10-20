import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { PastExecutions } from "@/modules/trade/orders/PastExecutions/PastExecutions"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

type Props = {
  readonly details: OrderData
}

export const DcaOrderDetailsMobileModal = ({ details }: Props) => {
  const { t } = useTranslation(["common", "trade"])
  const [terminateModalOpen, setTerminateModalOpen] = useState(false)

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
          p={getTokenPx("containers.paddings.primary")}
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
          p={getTokenPx("containers.paddings.primary")}
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
                value: details.toAmountExecuted,
                symbol: details.to.symbol,
              })}
            </Text>
          </Flex>
        </Flex>
        <ModalContentDivider />
        <Flex
          justify="space-between"
          p={getTokenPx("containers.paddings.primary")}
        >
          {details.blocksPeriod && (
            <>
              <Amount
                label={t("trade:trade.orders.dcaDetail.blockInterval")}
                value={t("trade:trade.orders.dcaDetail.schedulePeriod", {
                  timeframe: formatDistanceToNow(
                    Date.now() + details.blocksPeriod * PARACHAIN_BLOCK_TIME,
                    {
                      includeSeconds: true,
                    },
                  ),
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
            p={getTokenPx("containers.paddings.primary")}
            pt={getTokenPx("containers.paddings.secondary")}
          >
            <Button
              variant="danger"
              outline
              onClick={() => setTerminateModalOpen(true)}
            >
              <Icon component={Trash} size={14} />
              {t("trade:trade.cancelOrder.cta")}
            </Button>
            <Modal
              open={terminateModalOpen}
              onOpenChange={setTerminateModalOpen}
            >
              <TerminateDcaScheduleModalContent
                scheduleId={details.scheduleId}
                sold={details.fromAmountExecuted}
                total={details.fromAmountBudget}
                symbol={details.from.symbol}
                onClose={() => setTerminateModalOpen(false)}
              />
            </Modal>
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
