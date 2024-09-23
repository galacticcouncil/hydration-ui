import { Icon } from "components/Icon/Icon"
import { EVM_PROVIDERS } from "sections/web3-connect/constants/providers"
import { WalletMode } from "sections/web3-connect/store/useWeb3ConnectStore"
import {
  getWalletModeIcon,
  getWalletProviderByType,
  WalletProviderType,
} from "sections/web3-connect/Web3Connect.utils"

export type Web3ConnectProviderIconProps = {
  type: WalletProviderType
}

export const Web3ConnectProviderIcon: React.FC<
  Web3ConnectProviderIconProps
> = ({ type }) => {
  const { wallet } = getWalletProviderByType(type)
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
          {EVM_PROVIDERS.includes(type) && (
            <Icon
              css={{ position: "absolute", bottom: -3, right: -3 }}
              size={16}
              icon={<img src={getWalletModeIcon(WalletMode.EVM)} alt="" />}
            />
          )}
        </>
      )}
    </div>
  )
}
