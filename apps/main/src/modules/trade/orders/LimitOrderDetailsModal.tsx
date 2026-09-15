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
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { neckwork } from "@galacticcouncil/utils"
import Big from "big.js"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { LimitOrderStatus } from "@/modules/trade/orders/columns/LimitOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import {
  IntentLimitOrderData,
  OrderStatus,
} from "@/modules/trade/orders/lib/orderData"
import { useLimitFillStatus } from "@/modules/trade/orders/lib/useLimitFillStatus"
import { useRemoveIntent } from "@/modules/trade/orders/lib/useRemoveIntent"

type Props = {
  readonly details: IntentLimitOrderData
  readonly onCancel: () => void
  readonly pastExecutions?: ReactNode
  readonly isSpentLoading?: boolean
  readonly isReceivedLoading?: boolean
}

const isFilled = (amount: string | null): boolean => {
  if (!amount) return false
  return Big(amount ?? "0").gt(0)
}

export const LimitOrderDetailsModal = ({
  details,
  onCancel,
  pastExecutions = null,
  isSpentLoading = false,
  isReceivedLoading = false,
}: Props) => {
  const { t } = useTranslation(["common", "trade"])
  const removeIntent = useRemoveIntent()

  const { orderRate, marketRate } = useLimitFillStatus({
    from: details.from,
    to: details.to,
    sellAmount: details.fromAmountBudget,
    receiveAmount: details.toAmountBudget,
  })

  // Both sides stay hidden until something actually fills — a resting order has
  // nothing to report, and the pair reads wrong with only one half populated.
  const hasFills =
    isFilled(details.fromAmountExecuted) || isFilled(details.toAmountExecuted)

  return (
    <>
      <ModalHeader title={t("trade:trade.orders.limit.title")} align="center" />
      <ModalBody scrollable={false}>
        <Flex justify="space-between" align="center" pb="xl">
          <Flex direction="column" gap="s">
            {details.isPartiallyFillable && (
              <Text fs="p6" fw={500}>
                {t("trade:limit.partiallyFillable")}
              </Text>
            )}
            <SwapAmount
              fromAmount={details.fromAmountBudget}
              toAmount={details.toAmountBudget}
              from={details.from}
              to={details.to}
              showLogo
            />
          </Flex>
          {details.status && <DcaOrderStatus status={details.status} />}
        </Flex>
        {hasFills && (
          <>
            <ModalContentDivider />
            <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
              <Amount
                label={t("trade:trade.orders.limit.filledFrom")}
                isLoading={isSpentLoading}
                value={
                  isFilled(details.fromAmountExecuted)
                    ? t("currency", {
                        value: details.fromAmountExecuted,
                        symbol: details.from.symbol,
                      })
                    : "-"
                }
              />
              <Separator orientation="vertical" />
              <Amount
                label={t("trade:trade.orders.limit.filledTo")}
                isLoading={isReceivedLoading}
                value={
                  isFilled(details.toAmountExecuted)
                    ? t("currency", {
                        value: details.toAmountExecuted,
                        symbol: details.to.symbol,
                      })
                    : "-"
                }
              />
            </Grid>
          </>
        )}
        <ModalContentDivider />
        <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
          <Amount
            label={t("trade:trade.orders.limit.limitPrice")}
            value={
              orderRate
                ? t("trade:trade.orders.pricePair", {
                    value: orderRate,
                    leftSymbol: details.to.symbol,
                    rightSymbol: details.from.symbol,
                  })
                : "-"
            }
          />
          <Separator orientation="vertical" />
          <Amount
            label={t("trade:trade.orders.limit.marketPrice")}
            value={
              marketRate
                ? t("trade:trade.orders.pricePair", {
                    value: marketRate,
                    leftSymbol: details.to.symbol,
                    rightSymbol: details.from.symbol,
                  })
                : "-"
            }
          />
        </Grid>
        {orderRate && details.status === OrderStatus.Created && (
          <>
            <ModalContentDivider />
            <Grid columnTemplate="1fr" gap="xxl" py="xl">
              <Amount
                label={t("trade:trade.orders.limit.fillsWhen")}
                value={
                  <Flex align="center" gap="s">
                    <Text fw={500} fs="p4" lh={1} color={getToken("text.high")}>
                      {t("trade:trade.orders.limit.fillsWhenValue", {
                        fromSymbol: details.from.symbol,
                        rate: orderRate,
                        toSymbol: details.to.symbol,
                      })}
                    </Text>
                    <LimitOrderStatus order={details} long />
                  </Flex>
                }
              />
            </Grid>
          </>
        )}
        <ModalContentDivider />
        <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
          <Amount
            label={t("trade:trade.orders.limit.creationDate")}
            value={
              details.timestamp
                ? t("date.datetime", {
                    value: new Date(details.timestamp),
                  })
                : "-"
            }
          />
          <Separator orientation="vertical" />
          <Amount
            label={t("trade:trade.orders.limit.expirationDate")}
            value={
              details.deadline
                ? t("date.datetime", {
                    value: new Date(details.deadline),
                  })
                : "-"
            }
          />
        </Grid>
        <ModalContentDivider />
        <Flex justify="space-between" gap="base" pt="l">
          <Button variant="tertiary" outline asChild>
            <ExternalLink href={neckwork.intent(details.intentId)}>
              <Icon component={SquareArrowOutUpRight} size="xs" />
              <Text fw={500} fs="p6" lh={1.4}>
                {t("openInExplorer")}
              </Text>
            </ExternalLink>
          </Button>
          {details.status === OrderStatus.Created && (
            <Button
              variant="danger"
              outline
              onClick={() => {
                removeIntent.mutate(details.intentId, {
                  onSuccess: () => onCancel(),
                })
              }}
            >
              <Icon component={Trash} size="s" />
              {t("trade:trade.orders.limit.cancelOrder")}
            </Button>
          )}
        </Flex>
        {pastExecutions}
      </ModalBody>
    </>
  )
}
