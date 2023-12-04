import { Page } from "components/Layout/Page/Page"
import { Navigation } from "./navigation/Navigation"
import { Outlet } from "@tanstack/react-location"

export const PoolsPage = () => {
  // const array = [1, 2]
  // array.forEach((el) => {
  //   console.log(el)
  //   if (el === 1) return
  // })
  return (
    <Page subHeader={<Navigation />}>
      <Outlet />
    </Page>
  )
}
