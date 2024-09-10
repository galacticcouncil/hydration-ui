import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  WalletProviderType,
  getWalletProviderByType,
} from "sections/web3-connect/Web3Connect.utils"
import { FC, useMemo } from "react"
import { Spinner } from "components/Spinner/Spinner"
import {
  SContainer,
  SContent,
  SInnerContent,
} from "./Web3ConnectWalletLoader.styled"

type Web3ConnectWalletLoaderProps = {
  provider: WalletProviderType | WalletProviderType[]
}

const getImgSize = (count: number) => {
  switch (count) {
    case 1:
      return 48
    case 2:
      return 30
    default:
      return 24
  }
}

export const Web3ConnectWalletLoader: FC<Web3ConnectWalletLoaderProps> = ({
  provider,
}) => {
  const { t } = useTranslation()

  const providers = useMemo(() => {
    if (Array.isArray(provider)) {
      return provider.slice(0, 4).map(getWalletProviderByType)
    }
    return [getWalletProviderByType(provider)].filter(({ wallet }) => !!wallet)
  }, [provider])

  return (
    <SContainer>
      <SContent>
        <Spinner size={100} />
        <SInnerContent>
          {providers.map(({ wallet, type }) => (
            <img
              key={type}
              src={wallet?.logo.src}
              alt={wallet?.logo.alt}
              width={getImgSize(providers.length)}
              height={getImgSize(providers.length)}
            />
          ))}
        </SInnerContent>
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
      <div sx={{ mt: 8 }}>
        <Text tAlign="center" fs={16} color="basic200" fw={400} lh={22}>
          {t("walletConnect.pending.description")}
        </Text>
      </div>
    </SContainer>
  )
}
