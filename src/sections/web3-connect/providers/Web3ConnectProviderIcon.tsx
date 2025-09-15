import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"
import { WalletMode } from "sections/web3-connect/store/useWeb3ConnectStore"
import {
  getWalletModesByType,
  getWalletModeIcon,
  getWalletProviderByType,
  WalletProviderType,
} from "sections/web3-connect/Web3Connect.utils"

export type Web3ConnectProviderIconProps = {
  type: WalletProviderType
}

const modesWithIconsConfig = {
  [WalletMode.EVM]: true,
  [WalletMode.Solana]: true,
  [WalletMode.Sui]: true,
} as const

function hasModeIcon(
  mode: WalletMode,
): mode is keyof typeof modesWithIconsConfig {
  return mode in modesWithIconsConfig
}

export const Web3ConnectProviderIcon: React.FC<
  Web3ConnectProviderIconProps
> = ({ type }) => {
  const { t } = useTranslation()
  const { wallet } = getWalletProviderByType(type)

  const modes = getWalletModesByType(type)

  return (
    <div css={{ position: "relative" }}>
      {wallet && (
        <>
          <img
            loading="lazy"
            src={wallet?.logo.src}
            alt={wallet?.logo.alt}
            width={32}
            height={32}
          />
          {modes.filter(hasModeIcon).map((mode) => (
            <Icon
              key={mode}
              css={{ position: "absolute", bottom: -3, right: -3 }}
              size={16}
              icon={
                <img
                  src={getWalletModeIcon(mode)}
                  alt={t(`walletConnect.provider.mode.${mode}`)}
                />
              }
            />
          ))}
        </>
      )}
    </div>
  )
}
