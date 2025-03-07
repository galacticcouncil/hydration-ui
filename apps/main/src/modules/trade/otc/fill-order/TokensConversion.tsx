import { ArrowDown } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  ModalContentDivider,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"

type Props = {
  readonly offer: OtcOfferTabular
}

export const TokensConversion: FC<Props> = ({ offer }) => {
  const { t } = useTranslation(["trade", "common"])

  const price = new Big(offer.assetAmountIn)
    .div(offer.assetAmountOut)
    .toString()

  return (
    <Box height={35} alignContent="center" sx={{ position: "relative" }}>
      <ModalContentDivider />
      <Flex
        justify="space-between"
        sx={{
          position: "absolute",
          px: 12,
          top: "50%",
          width: "100%",
          transform: "translateY(-50%)",
        }}
      >
        <Box
          borderRadius={32}
          p={10}
          bg={getToken("details.separators")}
          sx={{ backdropFilter: "blur(3px)" }}
        >
          <ArrowDown sx={{ size: 12 }} />
        </Box>
        <Text
          py={5}
          px={14}
          borderRadius={16}
          bg={getToken("details.separators")}
          fw={500}
          fs="p6"
          lh={px(15.4)}
          color={getToken("text.high")}
          alignContent="center"
          display="flex"
          alignItems="center"
          gap={2}
          sx={{ backdropFilter: "blur(3px)" }}
        >
          {t("otc.fillOrder.conversion.price", {
            symbol: offer.assetOut.symbol,
          })}
          {t("common:number", { value: price })} {offer.assetIn.symbol}
        </Text>
      </Flex>
    </Box>
  )
}
