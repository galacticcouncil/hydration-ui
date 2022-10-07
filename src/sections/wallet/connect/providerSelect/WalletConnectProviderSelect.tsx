import { css } from "@emotion/react"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { Separator } from "components/Separator/Separator"
import { ExternalLink } from "components/Link/ExternalLink"
import { WalletConnectProviders } from "sections/wallet/connect/providers/WalletConnectProviders"
import { FC } from "react"
import { Wallet } from "@talismn/connect-wallets"

type Props = {
  onWalletSelect: (wallet: Wallet) => void
}

export const WalletConnectProviderSelect: FC<Props> = ({ onWalletSelect }) => {
  const { t } = useTranslation("translation")

  return (
    <>
      <Text fw={400} color="neutralGray200" sx={{ mt: 6 }}>
        {t("walletConnect.provider.description")}
      </Text>

      <WalletConnectProviders
        onConnect={onWalletSelect}
        onDownload={(wallet) => window.open(wallet.installUrl, "_blank")}
      />

      <Text
        fs={14}
        fw={400}
        tAlign="center"
        color="neutralGray400"
        sx={{ my: 20 }}
      >
        <Trans t={t} i18nKey="walletConnect.provider.terms">
          <ExternalLink href="/" sx={{ color: "orange100" }} />
        </Trans>
      </Text>

      <Separator
        color="white"
        opacity={0.06}
        sx={{ ml: -30 }}
        css={css`
          width: calc(100% + 60px);
        `}
      />

      <Text
        fw={400}
        fs={14}
        tAlign="center"
        color="neutralGray400"
        sx={{ mt: 26 }}
      >
        <Trans t={t} i18nKey="walletConnect.provider.learn">
          <ExternalLink href="/" sx={{ color: "primary450" }} />
        </Trans>
      </Text>
    </>
  )
}
