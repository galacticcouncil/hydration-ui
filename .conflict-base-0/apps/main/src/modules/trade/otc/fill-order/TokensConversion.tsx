import { ArrowDown } from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, ModalContentDivider } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { STokensConversionPrice } from "@/modules/trade/otc/fill-order/TokensConversion.styled"
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
        <STokensConversionPrice>
          {t("otc.fillOrder.conversion.price", {
            symbol: offer.assetOut.symbol,
          })}
          {t("common:currency", { value: price, symbol: offer.assetIn.symbol })}
        </STokensConversionPrice>
      </Flex>
    </Box>
  )
}
