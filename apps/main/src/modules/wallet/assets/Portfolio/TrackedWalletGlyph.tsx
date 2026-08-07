import { WalletExtension } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import trackedWalletAccentTokens from "@/modules/wallet/assets/Portfolio/trackedWalletAccentTokens.json"

type AccentTheme = keyof typeof trackedWalletAccentTokens
type Accent = (typeof trackedWalletAccentTokens)[AccentTheme][number]

const DEFAULT_ACCENT = {
  background: "oklch(70.26% 0.1410 250.00)",
  icon: "oklch(13.68% 0.0333 262.20)",
  text: "oklch(70.26% 0.1410 250.00)",
} satisfies Accent

export const getTrackedWalletAccent = (
  address: string | undefined,
  theme: AccentTheme,
): Accent => {
  const tokens = trackedWalletAccentTokens[theme]
  const fallback = tokens[0] ?? DEFAULT_ACCENT
  if (!address) return fallback

  const index = Array.from(address).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    0,
  )

  return tokens[index % tokens.length] ?? fallback
}

type Props = {
  readonly size?: number
  readonly iconSize?: number
  readonly address?: string
  readonly accent?: Accent
}

export const TrackedWalletGlyph: FC<Props> = ({
  size = 20,
  iconSize = 12,
  address,
  accent,
}) => {
  const { theme } = useTheme()
  const colors = accent ?? getTrackedWalletAccent(address, theme)

  return (
    <Flex
      align="center"
      justify="center"
      sx={{
        size: pxToRem(size),
        flexShrink: 0,
        borderRadius: "full",
        bg: colors.background,
        color: colors.icon,
        overflow: "hidden",
      }}
    >
      <Icon size={pxToRem(iconSize)} component={WalletExtension} />
    </Flex>
  )
}
