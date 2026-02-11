import "@galacticcouncil/ui/fonts.css"

import { ThemeProvider } from "@galacticcouncil/ui/theme"
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { I18nextProvider } from "react-i18next"
import { Toaster } from "sonner"

import { Page404 } from "@/components/Page404"
import { ProvideRpcResolver } from "@/components/ProviderRpcSelect/ProviderRpcResolver"
import i18n from "@/i18n"
import { AssetsProvider } from "@/providers/assetsProvider"
import { RpcProvider } from "@/providers/rpcProvider"

import { routeTree } from "./routeTree.gen"

const queryClient = new QueryClient()
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
        <ThemeProvider>
          <ProvideRpcResolver>
            <AssetsProvider>
              <RpcProvider>
                <TooltipProvider delayDuration={0}>
                  <RouterProvider router={router} />
                  <Toaster />
                </TooltipProvider>
              </RpcProvider>
            </AssetsProvider>
          </ProvideRpcResolver>
        </ThemeProvider>
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
