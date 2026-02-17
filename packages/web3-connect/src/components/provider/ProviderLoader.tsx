import { Box, Spinner, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isNonNullish } from "remeda"

import { ProviderIcons } from "@/components/provider/ProviderIcons"
import { WalletProviderType } from "@/config/providers"
import { getWallet } from "@/wallets"

import { SContainer, SpinnerContainer } from "./ProviderLoader.styled"

type ProviderLoaderProps = {
  providers: WalletProviderType[]
}

export const ProviderLoader: FC<ProviderLoaderProps> = ({ providers }) => {
  const { t } = useTranslation()
  const wallets = useMemo(() => {
    return providers.map(getWallet).filter(isNonNullish)
  }, [providers])

  return (
    <SContainer>
      <SpinnerContainer>
        <Spinner size={140} strokeWidth={1} />
        <ProviderIcons providers={wallets.map(({ provider }) => provider)} />
      </SpinnerContainer>
      <Box my="xl">
        <Text fs="p1" fw={500} align="center" transform="uppercase">
          {t("provider.waitingForAuth")}
        </Text>
        <Text align="center" fs="p2" color={getToken("text.medium")} fw={400}>
          {t("provider.authorizeDescription")}
        </Text>
      </Box>
    </SContainer>
  )
}
