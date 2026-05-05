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
  Text,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { useRemoveIntent } from "@/modules/trade/orders/lib/useRemoveIntent"

type Props = {
  readonly details: OrderData
  readonly onCancel: () => void
}

export const LimitOrderDetailsModal = ({ details, onCancel }: Props) => {
  const { t } = useTranslation(["common", "trade"])
  const removeIntent = useRemoveIntent()

  const limitPrice =
    details.toAmountExecuted &&
    details.fromAmountBudget &&
    Big(details.fromAmountBudget).gt(0)
      ? Big(details.toAmountExecuted).div(details.fromAmountBudget).toString()
      : null

  return (
    <>
      <ModalHeader
        title={t("trade:trade.orders.limitDetail.title")}
        align="center"
      />
      <ModalBody scrollable={false}>
        <Flex justify="space-between" align="center" pb="xl">
          <Flex direction="column" gap="s">
            {details.isPartiallyFillable && (
              <Text fs="p6" fw={500}>
                {t("trade:trade.orders.limitDetail.partiallyFillable")}
              </Text>
            )}
            <SwapAmount
              fromAmount={details.fromAmountBudget}
              toAmount={details.toAmountExecuted}
              from={details.from}
              to={details.to}
              showLogo
            />
          </Flex>
          {details.status && <DcaOrderStatus status={details.status} />}
        </Flex>
        <ModalContentDivider />
        <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
          <Amount
            label={t("trade:trade.orders.limitDetail.filledFrom")}
            value={
              details.isPartiallyFillable && details.fromAmountBudget
                ? t("currency", {
                    value: details.fromAmountBudget,
                    symbol: details.from.symbol,
                  })
                : "-"
            }
          />
          <Separator orientation="vertical" />
          <Amount
            label={t("trade:trade.orders.limitDetail.filledTo")}
            value={
              details.partialFilledAmount
                ? t("currency", {
                    value: details.partialFilledAmount,
                    symbol: details.to.symbol,
                  })
                : "-"
            }
          />
        </Grid>
        <ModalContentDivider />
        <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
          <Amount
            label={t("trade:trade.orders.limitDetail.limitPrice")}
            value={
              limitPrice
                ? `${t("number", { value: limitPrice })} ${details.to.symbol} / ${details.from.symbol}`
                : "-"
            }
          />
          <Separator orientation="vertical" />
          <Amount
            label={t("trade:trade.orders.limitDetail.avgPrice")}
            value="-"
          />
        </Grid>
        <ModalContentDivider />
        <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
          <Amount
            label={t("trade:trade.orders.limitDetail.startDate")}
            value="-"
          />
          <Separator orientation="vertical" />
          <Amount
            label={t("trade:trade.orders.limitDetail.endDate")}
            value="-"
          />
        </Grid>
        <ModalContentDivider />
        <Flex justify="flex-end" pt="l">
          <Button
            variant="danger"
            outline
            onClick={() => {
              if (details.intentId !== undefined) {
                removeIntent.mutate(details.intentId, {
                  onSuccess: () => onCancel(),
                })
              }
            }}
          >
            <Icon component={Trash} size="s" />
            {t("trade:trade.orders.limitDetail.cancelOrder")}
          </Button>
        </Flex>
      </ModalBody>
    </>
  )
}
