import { css } from "styled-components"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { Separator } from "components/Separator/Separator"
import { ExternalLink } from "components/Link/ExternalLink"
import { WalletConnectProviders } from "sections/wallet/connect/providers/WalletConnectProviders"
import { PROVIDER_DOWNLOAD_URLS } from "sections/wallet/connect/modal/WalletConnectModal.utils"
import { FC } from "react"

type Props = {
  onWalletSelect: (provider: "talisman" | "polkadot-js") => void
}

export const WalletConnectProviderSelect: FC<Props> = ({ onWalletSelect }) => {
  const { t } = useTranslation("translation")

  return (
    <>
      <Text fw={400} mt={6} color="neutralGray200">
        {t("walletConnect.provider.description")}
      </Text>

      <WalletConnectProviders
        onConnect={(provider) => {
          onWalletSelect(provider)
        }}
        onDownload={(provider) => {
          const url = PROVIDER_DOWNLOAD_URLS[provider]
          if (url) window.open(url, "_blank")
        }}
      />

      <Text
        mt={20}
        mb={30}
        fs={14}
        fw={400}
        tAlign="center"
        color="neutralGray400"
      >
        <Trans t={t} i18nKey="walletConnect.provider.terms">
          <ExternalLink href="/" color="orange100" />
        </Trans>
      </Text>

      <Separator
        ml={-30}
        color="white"
        opacity={0.06}
        css={css`
          width: calc(100% + 60px);
        `}
      />

      <Text fw={400} mt={26} fs={14} tAlign="center" color="neutralGray400">
        <Trans t={t} i18nKey="walletConnect.provider.learn">
          <ExternalLink href="/" color="primary450" />
        </Trans>
      </Text>
    </>
  )
}
