import { WalletExtension } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { stringEquals } from "@galacticcouncil/utils"
import { FC } from "react"

import trackedWalletAccentTokens from "@/modules/portfolio/tracked/trackedWalletAccentTokens.json"
import { useTrackedWallets } from "@/states/trackedWallets"

type AccentTheme = keyof typeof trackedWalletAccentTokens
type Accent = (typeof trackedWalletAccentTokens)[AccentTheme][number]

const DEFAULT_ACCENT = {
  background: "oklch(70.26% 0.1410 250.00)",
  icon: "oklch(13.68% 0.0333 262.20)",
  text: "oklch(70.26% 0.1410 250.00)",
} satisfies Accent

export const useTrackedWalletAccent = (address: string | undefined): Accent => {
  const { theme } = useTheme()
  const wallets = useTrackedWallets()
  const tokens = trackedWalletAccentTokens[theme]
  const fallback = tokens[0] ?? DEFAULT_ACCENT

  const index = wallets.findIndex((wallet) =>
    stringEquals(wallet.address, address ?? ""),
  )
  if (index < 0) return fallback

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
  const fallbackAccent = useTrackedWalletAccent(address)
  const colors = accent ?? fallbackAccent

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
