import { Outlet } from "@tanstack/react-router"

import { Header } from "@/modules/layout/components/Header"

export const MainLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
