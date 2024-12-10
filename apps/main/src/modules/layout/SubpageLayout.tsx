import { Outlet } from "@tanstack/react-router"

import { SubpageMenu } from "@/modules/layout/components/SubpageMenu"

export const SubpageLayout = () => {
  return (
    <>
      <SubpageMenu />
      <Outlet />
    </>
  )
}
