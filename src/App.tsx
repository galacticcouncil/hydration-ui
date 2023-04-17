import { AppProviders } from "components/AppProviders/AppProviders"
import {
  createBrowserHistory,
  ReactLocation,
  Router,
} from "@tanstack/react-location"
import { routes } from "./routes"
import { TestnetModal } from "sections/testnet/TestnetModal"
import { useEffect } from "react"

const history = createBrowserHistory()
const location = new ReactLocation({ history })

export const App = () => {
  useEffect(() => {
    const [html] = document.getElementsByTagName("html")
    const [head] = document.getElementsByTagName("head")

    const style = document.createElement("style")
    style.setAttribute("uigc-font-face", "")
    style.setAttribute("uigc-base", "")

    head.appendChild(style)
    html.setAttribute("theme", "hdx")

    return () => {
      html.removeAttribute("theme")
      head.removeChild(style)
    }
  }, [])

  return (
    <AppProviders>
      <Router location={location} routes={routes} />
      {import.meta.env.VITE_SENTRY_DSN && (
        <TestnetModal
          onBack={() => (window.location.href = "https://bsx.fi/")}
        />
      )}
    </AppProviders>
  )
}
