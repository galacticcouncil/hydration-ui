import { HydrationLogoFull } from "@galacticcouncil/ui/assets/icons"
import { Flex, Toggle } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { Web3ConnectButton } from "@galacticcouncil/web3-connect"

import { Web3ConnectButton as Web3ConnectButtonOld } from "@/components/Web3Connect/Web3ConnectButton"
import { SHeader } from "@/modules/layout/components/Header.styled"
import { HeaderMenu } from "@/modules/layout/components/HeaderMenu"

export const Header = () => {
  const { theme, setTheme } = useTheme()
  return (
    <SHeader>
      <HydrationLogoFull />
      <HeaderMenu display={["none", null, "flex"]} />
      <Flex ml="auto" align="center" gap={12}>
        <Flex gap={8}>
          Dark Mode
          <Toggle
            checked={theme === "dark"}
            onCheckedChange={(isDark) => setTheme(isDark ? "dark" : "light")}
          />
        </Flex>
        <Web3ConnectButtonOld />
        <Web3ConnectButton />
      </Flex>
    </SHeader>
  )
}
