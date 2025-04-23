import { FC, lazy, LazyExoticComponent, SVGProps } from "react"

import { SHeader } from "@/modules/layout/components/Header.styled"
import { HeaderToolbar } from "@/modules/layout/components/HeaderToolbar"
import { useHasTopNavbar } from "@/modules/layout/use-has-top-navbar"

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
  const hasTopNavbar = useHasTopNavbar()

  const Logo: LazyExoticComponent<FC<SVGProps<SVGSVGElement>>> = hasTopNavbar
    ? HydrationLogoFull
    : HydrationLogo

  return (
    <SHeader>
      <Logo />
      {hasTopNavbar && <HeaderMenu />}
      <HeaderToolbar />
    </SHeader>
  )
}
