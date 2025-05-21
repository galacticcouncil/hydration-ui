import { SubScan } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Box,
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
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import { SwapData } from "@/modules/trade/orders/lib/useSwapsData"

type Props = {
  readonly details: SwapData
}

export const SwapDetailsMobileModal = ({ details }: Props) => {
  const { t } = useTranslation(["common", "trade"])

  return (
    <>
      <ModalHeader
        title={t("trade:trade.orders.mobileDetail.title")}
        align="center"
      />
      <ModalContentDivider />
      <ModalBody>
        <Flex
          justify="space-between"
          align="center"
          p={getTokenPx("containers.paddings.primary")}
        >
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
              <DcaOrderStatus status={details.status.status} />
            )
          )}
        </Flex>
        <ModalContentDivider />
        <Grid
          columnTemplate="1fr auto 1fr"
          p={getTokenPx("containers.paddings.primary")}
        >
          <Flex
            direction="column"
            gap={getTokenPx("containers.paddings.quint")}
          >
            <Text fs={13} lh={1} color={getToken("text.low")}>
              {t("received")}
            </Text>
            <Text fw={500} fs={13} lh={1} color={getToken("text.high")}>
              {t("currency", {
                value: details.toAmount,
                symbol: details.to.symbol,
              })}
            </Text>
          </Flex>
          <Separator orientation="vertical" />
          <Flex
            direction="column"
            gap={getTokenPx("containers.paddings.quint")}
            sx={{ justifySelf: "end" }}
          >
            <Text fs={13} lh={1} color={getToken("text.low")}>
              {t("price")}
            </Text>
            <Text fw={500} fs={13} lh={1} color={getToken("text.high")}>
              {t("currency", {
                value: details.fillPrice,
                symbol: `${details.from.symbol} / ${details.to.symbol}`,
              })}
            </Text>
          </Flex>
        </Grid>
        <ModalContentDivider />
        <Box p={getTokenPx("containers.paddings.primary")}>
          <Amount
            label={t("date")}
            value={t("date.datetime", {
              value: details.date,
            })}
          />
        </Box>
        {details.link && (
          <>
            <ModalContentDivider />
            <Flex
              justify="flex-end"
              p={getTokenPx("containers.paddings.primary")}
              pt={getTokenPx("containers.paddings.secondary")}
            >
              <ExternalLink
                sx={{
                  textDecoration: "none",
                  display: "flex",
                  gap: 4,
                  px: getTokenPx("buttons.paddings.primary"),
                  border: "1px solid",
                  borderColor: getToken("buttons.secondary.low.borderRest"),
                  bg: getToken("buttons.secondary.low.rest"),
                  color: getToken("buttons.secondary.low.onRest"),
                  borderRadius: 20,
                  alignItems: "center",
                  height: 26,
                }}
                href={details.link}
              >
                <Icon component={SubScan} size={12} color="#FEFEFE" />
                <Text fw={500} fs="p6" lh={1.4}>
                  {t("trade:trade.orders.mobileDetail.openOnSubscan")}
                </Text>
              </ExternalLink>
            </Flex>
          </>
        )}
        <ModalContentDivider />
      </ModalBody>
    </>
  )
}
