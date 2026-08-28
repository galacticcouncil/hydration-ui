import { Flex } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Link } from "@tanstack/react-router"
import { FC, forwardRef, lazy, LazyExoticComponent, SVGProps } from "react"

import { LINKS } from "@/config/navigation"
import { SHeader } from "@/modules/layout/components/Header.styled"
import { HeaderToolbar } from "@/modules/layout/components/HeaderToolbar"
import { FULL_HEADER_BREAKPOINT } from "@/modules/layout/constants"
import { useHasTopNavbar } from "@/modules/layout/hooks/useHasTopNavbar"

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

export const Header = forwardRef<HTMLDivElement, unknown>((_props, ref) => {
  const hasTopNavbar = useHasTopNavbar()
  const { gte } = useBreakpoints()
  const isFullHeader = gte(FULL_HEADER_BREAKPOINT)

  const Logo: LazyExoticComponent<FC<SVGProps<SVGSVGElement>>> = isFullHeader
    ? HydrationLogoFull
    : HydrationLogo

  return (
    <SHeader ref={ref}>
      <Flex
        height="l"
        width={["l", null, null, null, "auto"]}
        align="center"
        justify="start"
        sx={{ flexShrink: 0, minWidth: "max-content" }}
        asChild
      >
        <Link to={LINKS.swap}>
          <Logo sx={{ width: "auto", height: "100%", flexShrink: 0 }} />
        </Link>
      </Flex>
      {hasTopNavbar && <HeaderMenu />}
      <HeaderToolbar />
    </SHeader>
  )
})

Header.displayName = "Header"
