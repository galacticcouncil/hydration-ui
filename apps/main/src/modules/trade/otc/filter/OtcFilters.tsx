import { UserRound } from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Separator } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { OrderFilter } from "@/modules/trade/otc/filter/OrderFilter"

export const OtcFilters: FC = () => {
  const { t } = useTranslation("trade")
  const { isConnected } = useAccount()

  return (
    <Flex gap={12} align="center">
      {isConnected && (
        <>
          <OrderFilter offers="my" iconStart={UserRound}>
            {t("otc.filters.offers.my")}
          </OrderFilter>
          <Separator orientation="vertical" sx={{ height: 38 }} />
        </>
      )}

      <Flex gap={8}>
        <OrderFilter offers="all">{t("otc.filters.offers.all")}</OrderFilter>
        <Box display={["none", "block"]}>
          <OrderFilter offers="partially-fillable">
            {t("otc.filters.offers.partiallyFillable")}
          </OrderFilter>
        </Box>
      </Flex>
    </Flex>
  )
}
