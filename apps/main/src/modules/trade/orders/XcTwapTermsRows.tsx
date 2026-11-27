import { CheckIcon, CopyIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  Flex,
  Grid,
  ModalContentDivider,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress, useCopy } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { XcTwapOrderInfo } from "@/modules/trade/orders/lib/orderData"
import { scaleHuman } from "@/utils/formatting"

type XcTwapTermsRowsProps = {
  readonly xc: XcTwapOrderInfo
}

/** Recipient and payout size, read from the order's terms. */
export const XcTwapTermsRows: FC<XcTwapTermsRowsProps> = ({ xc }) => {
  const { t } = useTranslation(["common", "trade"])
  const { copied, copy } = useCopy(5000)
  const { recipient, minDelivery } = xc.terms
  const destination = xc.destination

  return (
    <>
      <ModalContentDivider />
      <Grid columnTemplate="1fr 1px 1fr" gap="xxl" py="xl">
        <Amount
          label={t("trade:trade.orders.xc.detail.recipient")}
          value={
            <Flex align="center" gap="s">
              <Text fw={500} fs="p4" lh={1} color={getToken("text.high")}>
                {shortenAccountAddress(recipient)}
              </Text>
              <Button
                variant="ghost"
                size="micro"
                icon={copied ? CheckIcon : CopyIcon}
                disabled={copied}
                aria-label={t("copy")}
                onClick={() => copy(recipient)}
              />
            </Flex>
          }
        />
        <Separator orientation="vertical" />
        <Amount
          label={t("trade:trade.orders.xc.detail.payoutAt")}
          value={
            destination
              ? t("currency", {
                  value: scaleHuman(minDelivery, destination.decimals),
                  symbol: destination.symbol,
                })
              : "-"
          }
        />
      </Grid>
    </>
  )
}
