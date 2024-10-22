import { useMemo } from "react"
import { SProviderIconContainer } from "sections/web3-connect/modal/Web3ConnectFooter.styled"
import {
  getWalletProviderByType,
  WalletProviderType,
} from "sections/web3-connect/Web3Connect.utils"
import { ResponsiveValue } from "utils/responsive"

export type Web3ConnectProviderIconsProps = {
  providers: WalletProviderType[]
  size?: ResponsiveValue<number>
}

const DISPLAY_THRESHOLD = 4

export const Web3ConnectProviderIcons: React.FC<
  Web3ConnectProviderIconsProps
> = ({ providers = [], size = [24, 28] }) => {
  const connectedProviders = useMemo(() => {
    const maxVisible =
      providers.length === DISPLAY_THRESHOLD
        ? DISPLAY_THRESHOLD
        : DISPLAY_THRESHOLD - 1
    return [...providers]
      .reverse()
      .slice(0, maxVisible)
      .map(getWalletProviderByType)
  }, [providers])

  const remainingCount = providers.length - connectedProviders.length

  return (
    <SProviderIconContainer>
      {connectedProviders.map(({ type, wallet }) => (
        <div key={type} sx={{ bg: "darkBlue401", width: size, height: size }}>
          <img
            loading="lazy"
            src={wallet?.logo.src}
            alt={wallet?.logo.alt}
            width="100%"
            height="100%"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div sx={{ bg: "basic400", width: size, height: size }}>
          +{remainingCount}
        </div>
      )}
    </SProviderIconContainer>
  )
}
