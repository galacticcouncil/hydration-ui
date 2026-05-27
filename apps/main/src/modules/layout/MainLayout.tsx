import { Outlet } from "@tanstack/react-router"

import { Header } from "@/modules/layout/components/Header"
import { NewFarmsBannerWrapper } from "@/modules/liquidity/components/NewFarmsBanner/NewFarmsBanner"

export const MainLayout = () => {
  return (
    <>
      <NewFarmsBannerWrapper />
      <Header />
      <Outlet />
    </>
  )
}
