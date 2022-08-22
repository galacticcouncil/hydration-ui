import { Box } from "components/Box/Box"
import { useQuery } from "@tanstack/react-query"
import {
  PROVIDERS,
  ProviderType,
} from "sections/wallet/connect/modal/WalletConnectModal.utils"
import { WalletConnectProvidersButton } from "sections/wallet/connect/providers/button/WalletConnectProvidersButton"
import { FC } from "react"

type Props = {
  onConnect: (provider: ProviderType) => void
  onDownload: (provider: ProviderType) => void
}

export const WalletConnectProviders: FC<Props> = ({
  onConnect,
  onDownload,
}) => {
  const injected = useQuery(["provider"], () => {
    return Object.keys(window.injectedWeb3 ?? {})
  })

  return (
    <Box flex column align="stretch" mt={8} gap={8}>
      {PROVIDERS.map((provider) => {
        const isInjected = !!injected.data?.includes("polkadot-js")

        return (
          <WalletConnectProvidersButton
            key={provider}
            variant={provider}
            onClick={() => {
              if (isInjected) onConnect(provider)
              else onDownload(provider)
            }}
            isInjected={isInjected}
          />
        )
      })}
    </Box>
  )
}
