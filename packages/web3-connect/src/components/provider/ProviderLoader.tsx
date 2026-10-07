import { Box, Flex, Spinner, Text } from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isNonNullish, prop } from "remeda"

import { ProviderIcons } from "@/components/provider/ProviderIcons"
import { ProviderLogo } from "@/components/provider/ProviderLogo"
import { WalletProviderType } from "@/config/providers"
import { getWallet } from "@/wallets"

import { SContainer, SpinnerContainer } from "./ProviderLoader.styled"

type ProviderLoaderProps = {
  providers: WalletProviderType[]
  compact?: boolean
}

export const ProviderLoader: FC<ProviderLoaderProps> = ({
  providers,
  compact,
}) => {
  const { t } = useTranslation()
  const wallets = useMemo(() => {
    return providers.map(getWallet).filter(isNonNullish)
  }, [providers])

  if (compact) {
    return (
      <Flex align="center" gap="base" py="base">
        <Spinner size="l" />
        {wallets.map((wallet) => (
          <ProviderLogo key={wallet.provider} wallet={wallet} size="l" />
        ))}
        <Text fs="p4" fw={500}>
          {t("provider.connecting", {
            name: wallets.map(prop("title")).join(", "),
          })}
        </Text>
      </Flex>
    )
  }

  return (
    <SContainer>
      <SpinnerContainer>
        <Spinner size={pxToRem(140)} />
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
