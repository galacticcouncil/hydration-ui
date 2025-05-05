import "@/i18n"
import "@galacticcouncil/ui/fonts.css"

import { ThemeProvider } from "@galacticcouncil/ui/theme"
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { Toaster } from "sonner"

import { Page404 } from "@/components/Page404"
import { ProvideRpcResolver } from "@/components/ProviderRpcSelect/ProviderRpcResolver"
import { AssetsProvider } from "@/providers/assetsProvider"
import { RpcProvider } from "@/providers/rpcProvider"

import { routeTree } from "./routeTree.gen"

const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultPendingMs: 0,
  defaultNotFoundComponent: Page404,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export const App = () => {
  return (
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
  )
}

/**
 * Vite Preload Error Handling
 * @see https://vitejs.dev/guide/build#load-error-handling
 */
window.addEventListener("vite:preloadError", () => {
  window.location.reload()
})
