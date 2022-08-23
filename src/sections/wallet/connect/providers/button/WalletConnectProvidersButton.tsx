import { ProviderType } from "sections/wallet/connect/modal/WalletConnectModal.utils"
import { FC, ReactNode } from "react"
import { ReactComponent as PolkadotLogo } from "assets/icons/PolkadotLogo.svg"
import { ReactComponent as TalismanLogo } from "assets/icons/TalismanLogo.svg"
import { SWalletButton } from "sections/wallet/connect/providers/WalletConnectProviders.styled"
import { Text } from "components/Typography/Text/Text"
import { css } from "styled-components"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { ReactComponent as DownloadIcon } from "assets/icons/DownloadIcon.svg"
import { useTranslation } from "react-i18next"

type Props = {
  variant: ProviderType
  onClick: () => void
  isInjected: boolean
}

export const WalletConnectProvidersButton: FC<Props> = ({
  variant,
  onClick,
  isInjected,
}) => {
  const { t } = useTranslation()

  let logo: ReactNode = null
  let title: ReactNode = null

  if (variant === "polkadot-js") {
    logo = <PolkadotLogo />
    title = "Polkadot"
  } else if (variant === "talisman") {
    logo = <TalismanLogo />
    title = "Talisman"
  }

  return (
    <SWalletButton onClick={onClick} variant={variant}>
      {logo}
      <Text fs={18} css={{ flexGrow: 1 }}>
        {title}
      </Text>

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
        {isInjected ? (
          <>
            {t("walletConnect.provider.continue")}
            <ChevronRight />
          </>
        ) : (
          <>
            {t("walletConnect.provider.download")}
            <DownloadIcon />
          </>
        )}
      </Text>
    </SWalletButton>
  )
}
