import { SHeader } from "components/Layout/Header/Header.styled"
import { Link, useMatchRoute, useSearch } from "@tanstack/react-location"
import { LINKS, resetSearchParams } from "utils/navigation"
import { Suspense, lazy } from "react"
import { HydrationLogo } from "components/HydrationLogo"

const HeaderBanners = lazy(async () => ({
  default: (await import("components/Layout/Header/banners/HeaderBanners"))
    .HeaderBanners,
}))

const HeaderMenu = lazy(async () => ({
  default: (await import("components/Layout/Header/menu/HeaderMenu"))
    .HeaderMenu,
}))

const HeaderToolbar = lazy(async () => ({
  default: (await import("components/Layout/Header/toolbar/HeaderToolbar"))
    .HeaderToolbar,
}))

export const Header = () => {
  const search = useSearch()
  const matchRoute = useMatchRoute()

  const isSubmitTransactionPath = matchRoute({ to: LINKS.submitTransaction })

  return (
    <div css={{ position: "sticky", top: 0, zIndex: 5 }}>
      {!isSubmitTransactionPath && (
        <Suspense>
          <HeaderBanners />
        </Suspense>
      )}
      <SHeader>
        <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
          <div sx={{ flex: "row", align: "center", gap: 40 }}>
            <Link
              to={
                isSubmitTransactionPath ? LINKS.submitTransaction : LINKS.swap
              }
              search={resetSearchParams(search)}
            >
              <HydrationLogo />
            </Link>
            {!isSubmitTransactionPath && (
              <Suspense>
                <HeaderMenu />
              </Suspense>
            )}
          </div>
          <Suspense>
            <HeaderToolbar />
          </Suspense>
        </div>
      </SHeader>
    </div>
  )
}
