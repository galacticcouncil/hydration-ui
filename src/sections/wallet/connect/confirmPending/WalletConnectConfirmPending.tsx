import { css } from "@emotion/react"
import { Text } from "components/Typography/Text/Text"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Box } from "components/Box/Box"
import { Spinner } from "components/Spinner/Spinner.styled"
import { useTranslation } from "react-i18next"
import { FC } from "react"
import { getWalletBySource } from "@talismn/connect-wallets"

type Props = { provider: string }

export const WalletConnectConfirmPending: FC<Props> = ({ provider }) => {
  const { t } = useTranslation("translation")
  const wallet = getWalletBySource(provider)

  return (
    <Box flex align="center" column>
      <Box
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
      </Box>
      <GradientText mt={20} fs={24} fw={600} tAlign="center">
        {t("walletConnect.pending.title")}
      </GradientText>
      <Box pl={20} pr={20} mt={20} mb={40}>
        <Text tAlign="center" fs={16} color="neutralGray200" fw={400} lh={22}>
          {t("walletConnect.pending.description", { name: wallet?.title })}
        </Text>
      </Box>
    </Box>
  )
}
