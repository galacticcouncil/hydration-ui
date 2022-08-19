import { css } from "styled-components/macro"
import { ReactComponent as PolkadotLogo } from "assets/icons/PolkadotLogo.svg"
import { ReactComponent as TalismanLogo } from "assets/icons/TalismanLogo.svg"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { ReactComponent as DownloadIcon } from "assets/icons/DownloadIcon.svg"
import { ReactNode } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { StyledWalletButton } from "./WalletProviderList.styled"
import { Box } from "components/Box/Box"
import { useQuery } from "@tanstack/react-query"
import { ProviderType, PROVIDERS } from "./WalletConnectModal.utils"
import type { InjectedWindowProvider } from "@polkadot/extension-inject/types"

declare global {
  interface Window {
    injectedWeb3?: Record<string, InjectedWindowProvider>
  }
}

function WalletButton(props: {
  variant: ProviderType
  onClick: () => void
  status?: ReactNode
}) {
  let logo: ReactNode = null
  let title: ReactNode = null

  if (props.variant === "polkadot-js") {
    logo = <PolkadotLogo />
    title = "Polkadot"
  } else if (props.variant === "talisman") {
    logo = <TalismanLogo />
    title = "Talisman"
  }

  return (
    <StyledWalletButton onClick={props.onClick} variant={props.variant}>
      {logo}
      <Text fs={18} css={{ flexGrow: 1 }}>
        {title}
      </Text>
      {props.status && (
        <Text
          color="neutralGray300"
          fs={14}
          tAlign="right"
          css={css`
            display: flex;
            align-items: center;
            gap: 4px;
          `}
        >
          {props.status}
        </Text>
      )}
    </StyledWalletButton>
  )
}

export function WalletProviderList(props: {
  onConnect: (provider: ProviderType) => void
  onDownload: (provider: ProviderType) => void
}) {
  const { t } = useTranslation("translation")

  const injected = useQuery(["provider"], () => {
    return Object.keys(window.injectedWeb3 ?? {})
  })

  return (
    <Box flex column align="stretch" mt={8} gap={8}>
      {PROVIDERS.map((provider) => {
        const isInjected = injected.data?.includes("polkadot-js")
        return (
          <WalletButton
            key={provider}
            variant={provider}
            onClick={() => {
              if (isInjected) {
                props.onConnect(provider)
              } else {
                props.onDownload(provider)
              }
            }}
            status={
              isInjected ? (
                <>
                  {t("walletConnectModal.provider.continue")}
                  <ChevronRight />
                </>
              ) : (
                <>
                  {t("walletConnectModal.provider.download")}
                  <DownloadIcon />
                </>
              )
            }
          />
        )
      })}
    </Box>
  )
}
