import Avatar from "prettyavatars"

import { EmptyIdenticon } from "@/components/AccountAvatar/identicons/EmptyIdenticon"
import { Box, BoxProps } from "@/components/Box"
import { useUiScale } from "@/styles/media"

const DEFAULT_ACCOUNT_AVATAR_COLORS = [
  "#98AFFF",
  "#53A4F3",
  "#E53E76",
  "#F9AFCA",
  "#AAEEFC",
]

const ACCOUNT_AVATAR_COLORS_BY_THEME: Partial<
  Record<AccountAvatarTheme, string[]>
> = {
  auto: DEFAULT_ACCOUNT_AVATAR_COLORS,
  default: DEFAULT_ACCOUNT_AVATAR_COLORS,
  evm: ["#E27625", "#F5841F", "#FFBE77", "#CC6228", "#233447"],
  polkadot: DEFAULT_ACCOUNT_AVATAR_COLORS,
  solana: ["#9886E5", "#67C8FF", "#0058DD", "#FFEF46", "#AAEEFC"],
  sui: ["#67C8FF", "#0058DD", "#AAEEFC", "#53A4F3", "#98AFFF"],
  near: DEFAULT_ACCOUNT_AVATAR_COLORS,
  zcash: ["#FFEF46", "#EEDA0F", "#FF8C00", "#AAEEFC", "#53A4F3"],
  "aleph-zero": DEFAULT_ACCOUNT_AVATAR_COLORS,
  bravewallet: ["#FF2000", "#FF5500", "#FF452A", "#F5841F", "#FFBE77"],
  enkrypt: DEFAULT_ACCOUNT_AVATAR_COLORS,
  external: DEFAULT_ACCOUNT_AVATAR_COLORS,
  "fearless-wallet": DEFAULT_ACCOUNT_AVATAR_COLORS,
  "manta-wallet-js": DEFAULT_ACCOUNT_AVATAR_COLORS,
  metamask: ["#E27625", "#F5841F", "#FFBE77", "#CC6228", "#763E1A"],
  "nova-wallet": DEFAULT_ACCOUNT_AVATAR_COLORS,
  phantom: ["#9886E5", "#6D5BD0", "#C7BCFF", "#53A4F3", "#2B225A"],
  "polkadot-js": DEFAULT_ACCOUNT_AVATAR_COLORS,
  polkagate: DEFAULT_ACCOUNT_AVATAR_COLORS,
  "rabby-wallet": ["#8697FF", "#7084FF", "#D1D8FF", "#53A4F3", "#AAEEFC"],
  slush: ["#0C0A1F", "#461764", "#9886E5", "#98AFFF", "#AAEEFC"],
  solflare: ["#FFEF46", "#EEDA0F", "#FF8C00", "#02050A", "#F9AFCA"],
  subwallet: DEFAULT_ACCOUNT_AVATAR_COLORS,
  suiet: ["#0058DD", "#67C8FF", "#AAEEFC", "#53A4F3", "#98AFFF"],
  talisman: DEFAULT_ACCOUNT_AVATAR_COLORS,
  walletconnect: ["#3396FF", "#53A4F3", "#AAEEFC", "#98AFFF", "#0058DD"],
}

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
  theme = "auto",
  ...props
}) => {
  const uiScale = useUiScale()
  const scaledSize = size * uiScale
  const colors =
    ACCOUNT_AVATAR_COLORS_BY_THEME[theme] ?? DEFAULT_ACCOUNT_AVATAR_COLORS

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
      <Avatar
        variant="marble"
        name={address}
        size={scaledSize}
        colors={colors}
      />
    </Box>
  )
}
