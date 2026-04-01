import { Outlet } from "@tanstack/react-router"

import { Header } from "@/modules/layout/components/Header"
import { useRenderBanners } from "@/states/banners"

export const MainLayout = () => {
  useRenderBanners()

  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
