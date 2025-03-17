import {
  createBrowserHistory,
  ReactLocation,
  Router,
} from "@tanstack/react-location"
import { Suspense, useEffect } from "react"
import { routes } from "./routes"
import { Page } from "components/Layout/Page/Page"

import "unfonts.css"
import { AppProviders } from "components/AppProviders/AppProviders"

/**
 * Vite Preload Error Handling
 * @see https://vitejs.dev/guide/build#load-error-handling
 */
window.addEventListener("vite:preloadError", (event) => {
  window.location.reload()
})

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
      <Suspense>
        <AppProviders>
          <Page />
        </AppProviders>
      </Suspense>
    </Router>
  )
}
