import { css } from "@emotion/react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  WalletProviderType,
  getWalletProviderByType,
} from "sections/web3-connect/Web3Connect.utils"
import { FC } from "react"
import { Spinner } from "components/Spinner/Spinner"

type Props = { provider: WalletProviderType }

export const Web3ConnectProviderPending: FC<Props> = ({ provider }) => {
  const { t } = useTranslation()
  const { wallet } = getWalletProviderByType(provider)

  return (
    <div
      sx={{ flex: "column", align: "center" }}
      css={{ paddingBottom: "var(--wallet-footer-height)" }}
    >
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
        <Spinner size={80} />
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
        font="FontOver"
      >
        {t("walletConnect.pending.title")}
      </Text>
      <div sx={{ px: 20, mt: 20, mb: 40 }}>
        <Text tAlign="center" fs={16} color="basic200" fw={400} lh={22}>
          {t("walletConnect.pending.description", {
            name: wallet?.title,
          })}
        </Text>
      </div>
    </div>
  )
}
