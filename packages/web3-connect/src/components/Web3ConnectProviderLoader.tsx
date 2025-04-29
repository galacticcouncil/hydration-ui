import { Box, Spinner, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useMemo } from "react"
import { isNonNullish } from "remeda"

import { Web3ConnectProviderIcons } from "@/components/Web3ConnectProviderIcons"
import { WalletProviderType } from "@/config/providers"
import { getWallet } from "@/wallets"

import {
  SContainer,
  SpinnerContainer,
} from "./Web3ConnectProviderLoader.styled"

type Web3ConnectProviderLoaderProps = {
  providers: WalletProviderType[]
}

export const Web3ConnectProviderLoader: FC<Web3ConnectProviderLoaderProps> = ({
  providers,
}) => {
  const wallets = useMemo(() => {
    return providers.map(getWallet).filter(isNonNullish)
  }, [providers])

  return (
    <SContainer>
      <SpinnerContainer>
        <Spinner size={140} strokeWidth={1} />
        <Web3ConnectProviderIcons
          providers={wallets.map(({ provider }) => provider)}
        />
      </SpinnerContainer>
      <Box my={20}>
        <Text fs={19} fw={500} align="center" transform="uppercase">
          Waiting for authorization
        </Text>
        <Text align="center" fs={16} color={getToken("text.medium")} fw={400}>
          Please authorize your wallet extension to connect to Hydration.
        </Text>
      </Box>
    </SContainer>
  )
}
