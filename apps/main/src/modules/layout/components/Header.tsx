import { Flex, Toggle } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"

import { Navigation } from "@/modules/layout/components/Navigation"

export const Header = () => {
  const { theme, setTheme } = useTheme()
  return (
    <Flex
      p={20}
      borderBottom={1}
      borderColor={getToken("details.separators")}
      bg={getToken("surfaces.themeBasePalette.background")}
      sx={{ position: "sticky", top: 0, zIndex: 100 }}
      justify="space-between"
    >
      <Navigation />
      <Flex gap={8}>
        Dark Mode
        <Toggle
          checked={theme === "dark"}
          onCheckedChange={(isDark) => setTheme(isDark ? "dark" : "light")}
        />
      </Flex>
    </Flex>
  )
}
