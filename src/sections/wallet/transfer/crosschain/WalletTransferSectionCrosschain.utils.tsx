import { Text } from "components/Typography/Text/Text"
import { ReactComponent as Wormhole } from "assets/icons/crosschains/Wormhole.svg"
import { ReactComponent as Karura } from "assets/icons/crosschains/Karura.svg"
import { ReactNode } from "react"
import { ExternalLink } from "components/Link/ExternalLink"
import { Trans, useTranslation } from "react-i18next"

function CrosschainKaruraGuide() {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", align: "center", gap: 16 }}>
      <Trans t={t} i18nKey="wallet.assets.transfer.crosschain.guide.karura">
        <Text tAlign="center" fw={400} sx={{ maxWidth: 400 }} />

        <Text tAlign="center" fw={400} sx={{ maxWidth: 400 }} />

        <Text tAlign="center" fw={400} sx={{ maxWidth: 400 }} />

        <Text tAlign="center" fw={400} sx={{ color: "yellow300" }} />

        <Text tAlign="center" fw={400} sx={{ maxWidth: 500 }} />

        <ExternalLink
          href="https://docs.bsx.fi/howto_bridge/#karura"
          sx={{ color: "primary450" }}
        />
      </Trans>
    </div>
  )
}

export const CROSSCHAINS: Array<{
  icon: ReactNode
  guide?: ReactNode
  name: string
  type: "ingoing" | "outgoing" | "both"
  url: string
}> = [
  {
    icon: <Karura />,
    name: "Karura",
    type: "both",
    url: "https://apps.karura.network/bridge",
    guide: <CrosschainKaruraGuide />,
  },
  {
    icon: <Wormhole />,
    name: "Wormhole",
    type: "both",
    url: "https://www.portalbridge.com/#/transfer",
  },
]
