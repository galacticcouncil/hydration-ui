import { AppProviders } from "components/AppProviders/AppProviders"
import {
  createHashHistory,
  ReactLocation,
  Router,
} from "@tanstack/react-location"
import { routes } from "./routes"
import { TestnetModal } from "sections/testnet/TestnetModal"

import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const history = createHashHistory()
const location = new ReactLocation({ history })

export const App = () => {
  return (
    <AppProviders>
      <Router location={location} routes={routes} />
      {import.meta.env.VITE_SENTRY_DSN && (
        <TestnetModal
          onBack={() => (window.location.href = "https://bsx.fi/")}
        />
      )}

      <ReactQueryDevtools />
    </AppProviders>
  )
}
