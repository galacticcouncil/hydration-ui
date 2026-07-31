import { SubScan } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Box,
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
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import { RoutedTradeData } from "@/modules/trade/orders/lib/useRoutedTradesData"
import { SwapData } from "@/modules/trade/orders/lib/useSwapsData"

type Props = {
  readonly details: SwapData | RoutedTradeData
}

export const SwapDetailsModal = ({ details }: Props) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <>
      <ModalHeader
        title={t("trade:trade.orders.swapDetail.title")}
        align="center"
      />
      <ModalBody>
        <Flex justify="space-between" align="center" pb="xl">
          <SwapAmount
            fromAmount={details.fromAmount}
            from={details.from}
            toAmount={details.toAmount}
            to={details.to}
            showLogo
          />
          {details.status?.kind === "market" ? (
            <SwapStatus />
          ) : (
            details.status?.status && (
              <DcaOrderStatus status={details.status.status} isDcaSwap />
            )
          )}
        </Flex>
        <ModalContentDivider />
        <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
          <Amount
            label={t("received")}
            value={t("currency", {
              value: details.toAmount,
              symbol: details.to.symbol,
            })}
          />
          <Separator orientation="vertical" />
          <Amount
            label={t("price")}
            value={t("currency", {
              value: details.fillPrice,
              symbol: `${details.from.symbol} / ${details.to.symbol}`,
            })}
          />
        </Grid>
        <ModalContentDivider />
        <Box py="xl">
          <Amount
            label={t("date")}
            value={t("date.datetime", {
              value: details.date,
            })}
          />
        </Box>
        {"link" in details && details.link && (
          <>
            <ModalContentDivider />
            <Flex justify="flex-end" pt="l" pb="xl">
              <Button variant="tertiary" outline asChild>
                <ExternalLink href={details.link}>
                  <Icon component={SubScan} size="xs" />
                  <Text fw={500} fs="p6" lh={1.4}>
                    {t("trade:trade.orders.swapDetail.openOnSubscan")}
                  </Text>
                </ExternalLink>
              </Button>
            </Flex>
          </>
        )}
        <ModalContentDivider />
      </ModalBody>
    </>
  )
}
