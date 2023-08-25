import { LINKS } from "utils/navigation"
import { useTranslation } from "react-i18next"
import { ReactComponent as IconDCA } from "assets/icons/navigation/IconDCA.svg"
import { ReactComponent as IconOTC } from "assets/icons/navigation/IconOTC.svg"
import { ReactComponent as IconSwap } from "assets/icons/navigation/IconSwap.svg"
import { ReactComponent as IconBonds } from "assets/icons/Bonds.svg"
import { Link, useSearch } from "@tanstack/react-location"
import { ReactNode } from "react"
import { Text } from "components/Typography/Text/Text"
import { Icon } from "components/Icon/Icon"
import { theme } from "theme"

const Tab = ({
  to,
  icon,
  label,
}: {
  to: string
  icon: ReactNode
  label: string
}) => {
  const search = useSearch()

  return (
    <Link
      to={to}
      search={search}
      sx={{ height: "100%" }}
      css={{ "& > div > p:hover": { color: theme.colors.white } }}
    >
      {({ isActive }) => (
        <>
          <div
            sx={{
              flex: "row",
              gap: 6,
              align: "center",
              justify: "space-between",
              height: "100%",
            }}
            css={{ position: "relative" }}
          >
            <Icon sx={{ color: "brightBlue300" }} icon={icon} />
            <Text fs={13} color={isActive ? "white" : "iconGray"}>
              {label}
            </Text>
          </div>
          {isActive && (
            <div
              sx={{ height: 1, bg: "brightBlue300", width: "100%" }}
              css={{ position: "relative", bottom: 0 }}
            />
          )}
        </>
      )}
    </Link>
  )
}

export const SubNavigation = () => {
  const { t } = useTranslation()
  return (
    <div
      sx={{
        flex: "row",
        gap: [0, 42],
        justify: ["space-between", "flex-start"],
        align: "center",
        height: 42,
        px: [8, 20],
      }}
      css={{
        maxWidth: "var(--content-width)",
        margin: "0 auto",
      }}
    >
      <Tab to={LINKS.swap} icon={<IconSwap />} label="SWAP" />
      <Tab to={LINKS.otc} icon={<IconOTC />} label="Trade OTC" />
      <Tab to={LINKS.dca} icon={<IconDCA />} label="Trade DCA" />
      <Tab to={LINKS.bonds} icon={<IconBonds />} label="Bonds" />
    </div>
  )
}
