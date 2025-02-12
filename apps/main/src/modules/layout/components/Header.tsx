import { Flex, Toggle } from "@galacticcouncil/ui/components"
import { useBreakpoints, useTheme } from "@galacticcouncil/ui/theme"
import { FC, lazy, LazyExoticComponent, SVGProps } from "react"

import { SHeader } from "@/modules/layout/components/Header.styled"
import { HeaderWeb3ConnectButton } from "@/modules/layout/components/HeaderWeb3ConnectButton"

const HeaderMenu = lazy(async () => ({
  default: await import("@/modules/layout/components/HeaderMenu").then(
    (m) => m.HeaderMenu,
  ),
}))

const HydrationLogo = lazy(async () => ({
  default: await import("@galacticcouncil/ui/assets/icons").then(
    (m) => m.HydrationLogo,
  ),
}))

const HydrationLogoFull = lazy(async () => ({
  default: await import("@galacticcouncil/ui/assets/icons").then(
    (m) => m.HydrationLogoFull,
  ),
}))

export const Header = () => {
  const { theme, setTheme } = useTheme()
  const { isDesktop } = useBreakpoints()

  const Logo: LazyExoticComponent<FC<SVGProps<SVGSVGElement>>> = isDesktop
    ? HydrationLogoFull
    : HydrationLogo

  return (
    <SHeader>
      <Logo sx={{ flexShrink: 0 }} />
      {isDesktop && <HeaderMenu />}
      <Flex ml="auto" align="center" gap={12}>
        <Flex gap={8}>
          Dark Mode
          <Toggle
            checked={theme === "dark"}
            onCheckedChange={(isDark) => setTheme(isDark ? "dark" : "light")}
          />
        </Flex>
        <HeaderWeb3ConnectButton />
      </Flex>
    </SHeader>
  )
}
