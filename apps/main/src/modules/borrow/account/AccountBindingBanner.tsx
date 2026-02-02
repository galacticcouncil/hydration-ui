import VendingMachine from "@galacticcouncil/ui/assets/images/VendingMachine.webp"
import { Box, Button, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { evmAccountBindingQuery, useBindEvmAccount } from "@/api/evm"
import {
  SBanner,
  SBannerImage,
  SBannerImageContainer,
} from "@/modules/borrow/account/AccountBindingBanner.styled"
import { useRpcProvider } from "@/providers/rpcProvider"

export const AccountBindingBanner = () => {
  const { t } = useTranslation(["borrow"])
  const rpc = useRpcProvider()

  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: isBound, isSuccess } = useQuery(
    evmAccountBindingQuery(rpc, address),
  )

  const { mutate: bind } = useBindEvmAccount(address)

  if (!isSuccess || isBound) return null

  return (
    <SBanner>
      <Box maxWidth={["100%", null, "400px"]}>
        <Text
          font="primary"
          fw={700}
          mb="s"
          color={getToken("text.tint.primary")}
        >
          {t("binding.banner.title")}
        </Text>
        <Text fs="p5">{t("binding.banner.description")}</Text>
      </Box>
      <Box>
        <Button onClick={() => bind()}>{t("binding.banner.cta")}</Button>
      </Box>
      <SBannerImageContainer>
        <SBannerImage src={VendingMachine} loading="lazy" />
      </SBannerImageContainer>
    </SBanner>
  )
}
