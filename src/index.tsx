import "./interfaces/augment-bignumber"
import "./i18n/i18n"

import React from "react"
import { createRoot } from "react-dom/client"
import { App } from "App"
import reportWebVitals from "./reportWebVitals"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GlobalStyle } from "components/GlobalStyle"

const root = createRoot(document.getElementById("root")!)
const client = new QueryClient()

root.render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <GlobalStyle />
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
