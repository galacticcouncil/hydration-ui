import { Outlet } from "@tanstack/react-router"
import { FC, ReactNode } from "react"

import { BreadcrumbBar } from "@/modules/layout/components/BreadcrumbBar"
import { Container, MainContent } from "@/modules/layout/components/Content"
import { SubNavBar } from "@/modules/layout/components/SubNavBar"

type Props = {
  readonly actions?: ReactNode
  readonly ignoreCurrentSearch?: boolean
}

export const SubpageLayout: FC<Props> = ({ actions, ignoreCurrentSearch }) => {
  return (
    <Container>
      <BreadcrumbBar />
      <SubNavBar actions={actions} ignoreCurrentSearch={ignoreCurrentSearch} />
      <MainContent>
        <Outlet />
      </MainContent>
    </Container>
  )
}
