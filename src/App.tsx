import { AppProviders } from "components/AppProviders/AppProviders"
import {
  createHashHistory,
  ReactLocation,
  Router,
} from "@tanstack/react-location"
import { routes } from "./routes"
import { TestnetModal } from "sections/testnet/TestnetModal"
import { Button } from "components/Button/Button"
import { useToast } from "state/toasts"

const history = createHashHistory()
const location = new ReactLocation({ history })

export const App = () => {
  const { info } = useToast()
  return (
    <AppProviders>
      <Button onClick={() => info({ text: "test" })}>Open toast</Button>
      <Router location={location} routes={routes} />
      {import.meta.env.VITE_SENTRY_DSN && (
        <TestnetModal
          onBack={() => (window.location.href = "https://bsx.fi/")}
        />
      )}
    </AppProviders>
  )
}
