import { Outlet } from "@tanstack/react-location"

import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"

export const LendingPage = () => {
  return (
    <LendingPageProviders>
      <Outlet />
    </LendingPageProviders>
  )
}
