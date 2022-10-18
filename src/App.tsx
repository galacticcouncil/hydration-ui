import { AppProviders } from "components/AppProviders/AppProviders"
import {
  createHashHistory,
  ReactLocation,
  Router,
} from "@tanstack/react-location"
import { routes } from "./routes"

const history = createHashHistory()
const location = new ReactLocation({ history })

export const App = () => {
  return (
    <AppProviders>
      <Router location={location} routes={routes} />
    </AppProviders>
  )
}
