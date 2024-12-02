import { Flex, Toggle } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"

const NAVIGTION = [
  {
    title: "Trade",
    to: "/trade",
  },
  {
    title: "Liqduity",
    to: "/liquidity",
  },
  {
    title: "Wallet",
    to: "/wallet",
  },
  {
    title: "Transfer",
    to: "/transfer",
  },
  {
    title: "Stats",
    to: "/stats",
  },
  {
    title: "Staking",
    to: "/staking",
  },
]

export const Header = () => {
  const { theme, setTheme } = useTheme()
  return (
    <Flex
      p={20}
      borderBottom={1}
      borderColor={getToken("Details.separators")}
      bg={getToken("Surfaces.themeBasePalette.Background")}
      sx={{ position: "sticky", top: 0, zIndex: 100 }}
      justify="space-between"
    >
      <Flex gap={20}>
        {NAVIGTION.map(({ title, to }) => (
          <Link key={to} to={to}>
            {title}
          </Link>
        ))}
      </Flex>
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
