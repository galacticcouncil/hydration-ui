import { getToken } from "@galacticcouncil/ui/utils"
import { isNonNullish, reverse } from "remeda"

import {
  SContainer,
  SWalletBox,
} from "@/components/provider/ProviderIcons.styled"
import { ProviderLogo } from "@/components/provider/ProviderLogo"
import { WalletProviderType } from "@/config/providers"
import { getWallet } from "@/wallets"

export type ProviderIconsProps = {
  providers: WalletProviderType[]
}

const DISPLAY_THRESHOLD = 4

const getImgSize = (count: number) => {
  if (count >= 4) return 28
  return 32
}

const getFilteredWallets = (providers: WalletProviderType[]) => {
  const maxVisible =
    providers.length === DISPLAY_THRESHOLD
      ? DISPLAY_THRESHOLD
      : DISPLAY_THRESHOLD - 1
  return reverse(providers)
    .slice(0, maxVisible)
    .map(getWallet)
    .filter(isNonNullish)
}
export const ProviderIcons: React.FC<ProviderIconsProps> = ({
  providers = [],
}) => {
  const wallets = getFilteredWallets(providers)
  const remainingCount = Math.max(0, providers.length - wallets.length)

  return (
    <SContainer>
      {wallets.map((wallet) => (
        <SWalletBox
          key={wallet.provider}
          size={getImgSize(providers.length)}
          bg={getToken("surfaces.containers.high.hover")}
        >
          <ProviderLogo wallet={wallet} size="100%" />
        </SWalletBox>
      ))}
      {remainingCount > 0 && (
        <SWalletBox
          bg={getToken("buttons.primary.low.rest")}
          size={getImgSize(providers.length)}
        >
          +{remainingCount}
        </SWalletBox>
      )}
    </SContainer>
  )
}
