import { Flex } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC, forwardRef, lazy, LazyExoticComponent, SVGProps } from "react"

import { LINKS } from "@/config/navigation"
import { SHeader } from "@/modules/layout/components/Header.styled"
import { HeaderToolbar } from "@/modules/layout/components/HeaderToolbar"
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

  const Logo: LazyExoticComponent<FC<SVGProps<SVGSVGElement>>> = hasTopNavbar
    ? HydrationLogoFull
    : HydrationLogo

  return (
    <SHeader ref={ref}>
      <Flex
        height="l"
        width={["l", null, null, "auto"]}
        align="center"
        justify="start"
        asChild
      >
        <Link to={LINKS.swap} disabled={hasTopNavbar}>
          <Logo sx={{ width: "auto", height: "100%" }} />
        </Link>
      </Flex>
      {hasTopNavbar && <HeaderMenu />}
      <HeaderToolbar />
    </SHeader>
  )
})

Header.displayName = "Header"
