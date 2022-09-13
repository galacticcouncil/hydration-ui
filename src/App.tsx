import { PoolsPage } from "sections/pools/PoolsPage"
import { AppProviders } from "components/AppProviders/AppProviders"

export const App = () => {
  return (
    <AppProviders>
      <PoolsPage />
    </AppProviders>
  )
}
