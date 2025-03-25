import { Outlet } from "@tanstack/react-router"

import { Content } from "@/modules/layout/components/Content"
import { Header } from "@/modules/layout/components/Header"

export const MainLayout = () => {
  return (
    <>
      <Header />
      <Content as="main">
        <Outlet />
      </Content>
    </>
  )
}
