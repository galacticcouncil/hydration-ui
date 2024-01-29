import { Outlet } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { MainLayout } from "sections/lending/layouts/MainLayout"

export const LendingPage = () => {
  return (
    <Page>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </Page>
  )
}
