import { useMemo } from "react"
import { SProviderIconContainer } from "sections/web3-connect/modal/Web3ConnectFooter.styled"
import {
  getWalletProviderByType,
  WalletProviderType,
} from "sections/web3-connect/Web3Connect.utils"

export type Web3ConnectProviderIconsProps = {
  providers: WalletProviderType[]
}

const DISPLAY_THRESHOLD = 3

export const Web3ConnectProviderIcons: React.FC<
  Web3ConnectProviderIconsProps
> = ({ providers = [] }) => {
  const connectedProviders = useMemo(() => {
    return providers.slice(0, DISPLAY_THRESHOLD).map(getWalletProviderByType)
  }, [providers])

  const remainingCount = providers.length - connectedProviders.length

  return (
    <SProviderIconContainer>
      {connectedProviders.map(({ type, wallet }) => (
        <div key={type} sx={{ bg: "darkBlue401" }}>
          <img
            src={wallet?.logo.src}
            alt={wallet?.logo.alt}
            width="100%"
            height="100%"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div sx={{ bg: "basic400" }}>+{remainingCount}</div>
      )}
    </SProviderIconContainer>
  )
}
