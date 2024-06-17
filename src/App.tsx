import {
  createBrowserHistory,
  ReactLocation,
  Router,
} from "@tanstack/react-location"
import { lazy, Suspense, useEffect } from "react"
import { routes } from "./routes"
import { Page } from "components/Layout/Page/Page"
import { AppLoader } from "components/AppLoader/AppLoader"

import "unfonts.css"

const AppProviders = lazy(async () => ({
  default: (await import("components/AppProviders/AppProviders")).AppProviders,
}))

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
    <Router location={location} routes={routes}>
      <Suspense fallback={<AppLoader />}>
        <AppProviders>
          <Page />
        </AppProviders>
      </Suspense>
    </Router>
  )
}
