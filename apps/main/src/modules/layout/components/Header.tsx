import { HydrationLogoFull } from "@galacticcouncil/ui/assets/icons"
import { Flex, Toggle } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"

import { SHeader } from "@/modules/layout/components/Header.styled"
import { HeaderMenu } from "@/modules/layout/components/HeaderMenu"
import { HeaderWeb3ConnectButton } from "@/modules/layout/components/HeaderWeb3ConnectButton"

export const Header = () => {
  const { theme, setTheme } = useTheme()
  return (
    <SHeader>
      <HydrationLogoFull sx={{ flexShrink: 0 }} />
      <HeaderMenu display={["none", null, "flex"]} />
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
