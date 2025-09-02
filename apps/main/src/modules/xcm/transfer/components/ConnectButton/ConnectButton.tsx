import { ChevronDown, WalletIcon } from "@galacticcouncil/ui/assets/icons"
import { ButtonProps, Icon, Logo } from "@galacticcouncil/ui/components"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"

import { SConnectButton } from "@/modules/xcm/transfer/components/ConnectButton/ConnecButton.styled"

export type ConnectButtonProps = ButtonProps & {
  walletProvider?: WalletProviderType
  emptyFallback: string
  address?: string
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  walletProvider,
  address,
  emptyFallback,
  ...props
}) => {
  const wallet = walletProvider ? getWallet(walletProvider) : null
  return (
    <SConnectButton
      size="small"
      variant={address ? "transparent" : "accent"}
      outline={!address}
      sx={!address ? { textTransform: "uppercase" } : undefined}
      {...props}
    >
      {!address && <Icon size={12} component={WalletIcon} />}
      {wallet && <Logo src={wallet.logo} size="extra-small" />}
      {address ? shortenAccountAddress(address) : emptyFallback}
      {address && <Icon size={12} component={ChevronDown} />}
    </SConnectButton>
  )
}
