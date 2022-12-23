import "./interfaces/augment-bignumber"
import "./i18n/i18n"

import React from "react"
import { createRoot } from "react-dom/client"
import { App } from "App"
import reportWebVitals from "./reportWebVitals"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GlobalStyle } from "components/GlobalStyle"
import { Global } from "@emotion/react"
import "react-loading-skeleton/dist/skeleton.css"

import "virtual:vite-plugin-sentry/sentry-config"
import * as Sentry from "@sentry/react"

// At the moment, tree-shaking does not work as expected
// thus, Sentry is bundled anyway
// See: https://github.com/vitejs/vite/issues/5676
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    dist: import.meta.env.VITE_PLUGIN_SENTRY_CONFIG.dist,
    release: import.meta.env.VITE_PLUGIN_SENTRY_CONFIG.release,
  })
}

const root = createRoot(document.getElementById("root")!)
const client = new QueryClient()

root.render(
  <QueryClientProvider client={client}>
    <Global styles={GlobalStyle} />
    <App />
  </QueryClientProvider>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
