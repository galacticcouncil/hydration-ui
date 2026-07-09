import { EmptyIdenticon } from "@/components/AccountAvatar/identicons/EmptyIdenticon"
import { getHydrationIdenticanPalette } from "@/components/AccountAvatar/identicons/hydrationIdenticanPalette"
import { identicanDataUri } from "@/components/AccountAvatar/identicons/identican"
import { Box, BoxProps } from "@/components/Box"
import { useUiScale } from "@/styles/media"
import { useTheme } from "@/theme"

export type AccountAvatarTheme =
  | "auto"
  | "default"
  | "polkadot"
  | "evm"
  | "talisman"
  | "solana"
  | "sui"
  | "near"
  | "zcash"
  | "aleph-zero"
  | "bravewallet"
  | "enkrypt"
  | "external"
  | "fearless-wallet"
  | "manta-wallet-js"
  | "metamask"
  | "nova-wallet"
  | "phantom"
  | "polkadot-js"
  | "polkagate"
  | "rabby-wallet"
  | "slush"
  | "solflare"
  | "subwallet"
  | "suiet"
  | "walletconnect"

export type AccountAvatarProps = BoxProps & {
  address: string
  size?: number
  theme?: AccountAvatarTheme
}

export const AccountAvatar: React.FC<AccountAvatarProps> = ({
  address,
  size = 32,
  sx,
  theme: _theme = "auto",
  ...props
}) => {
  const uiScale = useUiScale()
  const { theme } = useTheme()
  const scaledSize = size * uiScale

  if (!address) {
    return <EmptyIdenticon size={scaledSize} />
  }

  return (
    <Box
      borderRadius="full"
      size={scaledSize}
      sx={{ ...sx, overflow: "hidden" }}
      {...props}
    >
      <img
        alt=""
        aria-hidden="true"
        height={scaledSize}
        src={identicanDataUri(address, {
          crop: { scale: 1.4, x: 0, y: -15 },
          palette: getHydrationIdenticanPalette(theme),
          size: scaledSize,
        })}
        style={{ display: "block", height: "100%", width: "100%" }}
        width={scaledSize}
      />
    </Box>
  )
}
