import { Button, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SwapType } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"

type Props = {
  readonly type: SwapType
}

export const MarketFooter: FC<Props> = ({ type }) => {
  const { t } = useTranslation("trade")
  const { account } = useAccount()

  return (
    <Flex
      sx={{
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
        p: 20,
      }}
    >
      {account ? (
        <Button type="submit" size="large" width="100%">
          {type === "swap" ? t("market.footer.swap") : t("market.twap.cta")}
        </Button>
      ) : (
        <Web3ConnectButton size="large" width="100%" />
      )}

      <Text fs="p5" fw={400} color={getToken("text.high")}>
        {t("market.footer.description")}
      </Text>
    </Flex>
  )
}
