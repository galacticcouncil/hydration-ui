import { HydrationLogoFull } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Toggle } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import { SHeader } from "@/modules/layout/components/Header.styled"
import { HeaderMenu } from "@/modules/layout/components/HeaderMenu"

export const Header = () => {
  const { t } = useTranslation(["common"])
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
        <Button variant="secondary">{t("common:connectWallet")}</Button>
      </Flex>
    </SHeader>
  )
}
