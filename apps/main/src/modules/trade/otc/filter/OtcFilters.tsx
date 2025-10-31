import { UserRound } from "@galacticcouncil/ui/assets/icons"
import { Flex, Separator } from "@galacticcouncil/ui/components"
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
          <OrderFilter offers="my">
            <UserRound />
            {t("otc.filters.offers.my")}
          </OrderFilter>
          <Separator orientation="vertical" sx={{ height: 38 }} />
        </>
      )}
      <OrderFilter offers="all">{t("otc.filters.offers.all")}</OrderFilter>
    </Flex>
  )
}
