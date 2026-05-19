import { ChevronDown, WalletIcon } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  ButtonProps,
  Icon,
  Logo,
} from "@galacticcouncil/ui/components"
import {
  isH160Address,
  isSS58Address,
  safeConvertAddressH160,
  safeConvertAddressSS58,
  shortenAccountAddress,
} from "@galacticcouncil/utils"
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
  const formattedAddress = isH160Address(address)
    ? safeConvertAddressH160(address)
    : isSS58Address(address)
      ? safeConvertAddressSS58(address)
      : address

  const wallet = walletProvider ? getWallet(walletProvider) : null
  return (
    <SConnectButton
      size="small"
      variant={formattedAddress ? "transparent" : "accent"}
      outline={!formattedAddress}
      sx={!formattedAddress ? { textTransform: "uppercase" } : undefined}
      {...props}
    >
      {!formattedAddress && (
        <Icon size="xs" component={WalletIcon} sx={{ ml: 4 }} />
      )}
      {wallet ? (
        <Logo src={wallet.logo} size="extra-small" />
      ) : formattedAddress ? (
        <AccountAvatar address={formattedAddress} size={12} />
      ) : null}
      {formattedAddress ? shortenAccountAddress(formattedAddress) : placeholder}
      {formattedAddress && <Icon size="xs" component={ChevronDown} />}
    </SConnectButton>
  )
}
