import "@galacticcouncil/ui/fonts.css"

import { ThemeProvider } from "@galacticcouncil/ui/theme"
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { I18nextProvider } from "react-i18next"
import { Toaster } from "sonner"

import { Page404 } from "@/components/Page404"
import { ProvideRpcResolver } from "@/components/ProviderRpcSelect/ProviderRpcResolver"
import { RouteError } from "@/components/RouteError"
import i18n from "@/i18n"

import { routeTree } from "./routeTree.gen"

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error("[RQ]", error, query)
    },
  }),
})
export interface RouterContext {
  queryClient: QueryClient
  i18n: typeof i18n
}

const routerContext: RouterContext = {
  queryClient,
  i18n,
}

const router = createRouter({
  routeTree,
  context: routerContext,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultPendingMs: 0,
  defaultNotFoundComponent: Page404,
  defaultErrorComponent: RouteError,
  scrollRestoration: true,
  scrollRestorationBehavior: "smooth",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ProvideRpcResolver>
          <ThemeProvider>
            <TooltipProvider delayDuration={0}>
              <RouterProvider router={router} />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </ProvideRpcResolver>
      </QueryClientProvider>
    </I18nextProvider>
  )
}

/**
 * Vite Preload Error Handling
 * @see https://vitejs.dev/guide/build#load-error-handling
 */
window.addEventListener("vite:preloadError", () => {
  window.location.reload()
})
