import { css } from "@emotion/react"
import { Text } from "components/Typography/Text/Text"
import { Spinner } from "components/Spinner/Spinner.styled"
import { useTranslation } from "react-i18next"
import { getWalletBySource } from "@talismn/connect-wallets"

type Props = { provider: string }

export const WalletConnectConfirmPending = ({ provider }: Props) => {
  const { t } = useTranslation("translation")
  const wallet = getWalletBySource(provider)

  return (
    <div sx={{ flex: "column", align: "center" }}>
      <div
        css={css`
          display: grid;
          grid-template-columns: 1fr;

          align-items: center;
          justify-items: center;

          > * {
            grid-column: 1;
            grid-row: 1;
          }
        `}
      >
        <Spinner css={{ width: 80, height: 80 }} />
        <img
          src={wallet?.logo.src}
          alt={wallet?.logo.alt}
          width={48}
          height={48}
        />
      </div>
      <Text
        fs={19}
        fw={500}
        tAlign="center"
        sx={{ mt: 20 }}
        tTransform="uppercase"
        css={{ fontFamily: "FontOver" }}
      >
        {t("walletConnect.pending.title")}
      </Text>
      <div sx={{ px: 20, mt: 20, mb: 40 }}>
        <Text tAlign="center" fs={16} color="basic200" fw={400} lh={22}>
          {t("walletConnect.pending.description", { name: wallet?.title })}
        </Text>
      </div>
    </div>
  )
}
