import { css } from "styled-components"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { Separator } from "components/Separator/Separator"
import { ExternalLink } from "components/Link/ExternalLink"
import { WalletProviderList } from "./WalletProviderList"
import { PROVIDER_DOWNLOAD_URLS } from "./WalletConnectModal.utils"

export function WalletProviderSelectSection(props: {
  onWalletSelect: (provider: "talisman" | "polkadot-js") => void
}) {
  const { t } = useTranslation("translation")

  return (
    <>
      <Text fw={400} mt={6} color="neutralGray200">
        {t("walletConnectModal.provider.description")}
      </Text>

      <WalletProviderList
        onConnect={(provider) => {
          props.onWalletSelect(provider)
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
        <Trans t={t} i18nKey="walletConnectModal.provider.terms">
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
        <Trans t={t} i18nKey="walletConnectModal.provider.learn">
          <ExternalLink href="/" color="primary450" />
        </Trans>
      </Text>
    </>
  )
}
