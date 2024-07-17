import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  WalletProviderType,
  getWalletProviderByType,
} from "sections/web3-connect/Web3Connect.utils"
import { FC } from "react"
import { Spinner } from "components/Spinner/Spinner"
import { SContainer, SContent } from "./Web3ConnectWalletLoader.styled"

type Props = { provider: WalletProviderType }

export const Web3ConnectWalletLoader: FC<Props> = ({ provider }) => {
  const { t } = useTranslation()
  const { wallet } = getWalletProviderByType(provider)
  return (
    <SContainer>
      <SContent>
        <Spinner size={100} />
        <img
          src={wallet?.logo.src}
          alt={wallet?.logo.alt}
          width={48}
          height={48}
        />
      </SContent>
      <Text
        fs={19}
        fw={500}
        tAlign="center"
        sx={{ mt: 20 }}
        tTransform="uppercase"
        font="GeistMono"
      >
        {t("walletConnect.pending.title")}
      </Text>
      <div sx={{ px: 20, mt: 20 }}>
        <Text tAlign="center" fs={16} color="basic200" fw={400} lh={22}>
          {t("walletConnect.pending.description", {
            name: wallet?.title,
          })}
        </Text>
      </div>
    </SContainer>
  )
}
