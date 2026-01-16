import { ChevronDown, WalletIcon } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  ButtonProps,
  Icon,
  Logo,
} from "@galacticcouncil/ui/components"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"

import { SConnectButton } from "@/modules/xcm/transfer/components/ConnectButton/ConnectButton.styled"

export type ConnectButtonProps = ButtonProps & {
  walletProvider?: WalletProviderType
  placeholder: string
  address?: string
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  walletProvider,
  address,
  placeholder,
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
      {!address && <Icon size={12} component={WalletIcon} sx={{ ml: 4 }} />}
      {wallet ? (
        <Logo src={wallet.logo} size="extra-small" />
      ) : address ? (
        <AccountAvatar address={address} size={12} />
      ) : null}
      {address ? shortenAccountAddress(address) : placeholder}
      {address && <Icon size={12} component={ChevronDown} />}
    </SConnectButton>
  )
}
