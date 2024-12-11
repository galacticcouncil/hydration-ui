import { HydrationLogoFull } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Toggle } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { HeaderMenu } from "@/modules/layout/components/HeaderMenu"

export const Header = () => {
  const { t } = useTranslation(["common"])
  const { theme, setTheme } = useTheme()
  return (
    <Flex
      py={10}
      px={[20, null, 30]}
      gap={[20, null, 40]}
      borderBottom={1}
      borderColor={getToken("details.separators")}
      bg={getToken("surfaces.themeBasePalette.background")}
      sx={{ position: "sticky", top: 0, zIndex: 100 }}
      align="center"
    >
      <HydrationLogoFull />
      <HeaderMenu />
      <Flex ml="auto" align="center" gap={12}>
        <Flex gap={8}>
          Dark Mode
          <Toggle
            checked={theme === "dark"}
            onCheckedChange={(isDark) => setTheme(isDark ? "dark" : "light")}
          />
        </Flex>
        <Button variant="secondary">{t("common:connectWallet")}</Button>
      </Flex>
    </Flex>
  )
}
