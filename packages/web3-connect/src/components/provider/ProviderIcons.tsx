import { Box } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useMemo } from "react"
import { isNonNullish, reverse } from "remeda"

import { SContainer } from "@/components/provider/ProviderIcons.styled"
import { WalletProviderType } from "@/config/providers"
import { getWallet } from "@/wallets"

export type ProviderIconsProps = {
  providers: WalletProviderType[]
}

const DISPLAY_THRESHOLD = 4

const getImgSize = (count: number) => {
  switch (count) {
    case 1:
      return 48
    case 2:
      return 40
    case 3:
      return 30
    default:
      return 28
  }
}

export const ProviderIcons: React.FC<ProviderIconsProps> = ({
  providers = [],
}) => {
  const connectedWallets = useMemo(() => {
    const maxVisible =
      providers.length === DISPLAY_THRESHOLD
        ? DISPLAY_THRESHOLD
        : DISPLAY_THRESHOLD - 1
    return reverse(providers)
      .slice(0, maxVisible)
      .map(getWallet)
      .filter(isNonNullish)
  }, [providers])

  const remainingCount = Math.max(0, providers.length - connectedWallets.length)

  return (
    <SContainer>
      {connectedWallets.map(({ provider, logo, title }) => (
        <Box
          key={provider}
          sx={{ bg: "darkBlue401", size: getImgSize(providers.length) }}
        >
          <img
            loading="lazy"
            src={logo}
            alt={title}
            width="100%"
            height="100%"
          />
        </Box>
      ))}
      {remainingCount > 0 && (
        <Box
          sx={{
            bg: getToken("buttons.primary.low.rest"),
            size: getImgSize(providers.length),
          }}
        >
          +{remainingCount}
        </Box>
      )}
    </SContainer>
  )
}
