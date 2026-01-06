import { Outlet } from "@tanstack/react-router"
import { useMeasure } from "react-use"

import { Content } from "@/modules/layout/components/Content"
import { Header } from "@/modules/layout/components/Header"

export const MainLayout = () => {
  const [ref] = useMeasure<HTMLDivElement>()

  return (
    <>
      <Header ref={ref} />
      <Content
        as="main"
        sx={{ "--header-width": `${document.documentElement.clientWidth}px` }}
      >
        <Outlet />
      </Content>
    </>
  )
}
