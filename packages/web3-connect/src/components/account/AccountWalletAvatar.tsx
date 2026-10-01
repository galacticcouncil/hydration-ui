import { AccountAvatar, Flex } from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"

import { SProviderBadge } from "@/components/Web3ConnectButton.styled"
import { WalletProviderType } from "@/config/providers"
import { getWallet } from "@/wallets"

type Props = {
  readonly address: string
  readonly provider?: WalletProviderType
  readonly size?: number
  readonly badgeSize?: number
}

export const AccountWalletAvatar = ({
  address,
  provider,
  size = 26,
  badgeSize = 12,
}: Props) => {
  const wallet = getWallet(provider)

  return (
    <Flex position="relative" sx={{ flexShrink: 0 }}>
      <AccountAvatar address={address} size={size} />
      {wallet?.logo && (
        <SProviderBadge wallet={wallet} size={pxToRem(badgeSize)} />
      )}
    </Flex>
  )
}
