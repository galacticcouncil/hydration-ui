import "@/i18n"
import "@galacticcouncil/ui/fonts.css"

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client"
import { ThemeProvider } from "@galacticcouncil/ui/theme"
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { Toaster } from "sonner"

import { InvalidateOnBlock } from "@/components/InvalidateOnBlock"
import { Page404 } from "@/components/Page404"
import { AssetsProvider } from "@/providers/assetsProvider"
import { RpcProvider } from "@/providers/rpcProvider"

import { routeTree } from "./routeTree.gen"

const queryClient = new QueryClient()

const apolloClient = new ApolloClient({
  link: split(
    (operation) => operation.getContext().clientName === "squid",
    new HttpLink({
      uri: import.meta.env.VITE_SQUID_URL,
    }),
    new HttpLink({
      uri: import.meta.env.VITE_INDEXER_URL,
    }),
  ),
  cache: new InMemoryCache(),
})

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
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AssetsProvider>
            <RpcProvider>
              <InvalidateOnBlock>
                <TooltipProvider delayDuration={0}>
                  <RouterProvider router={router} />
                  <Toaster />
                </TooltipProvider>
              </InvalidateOnBlock>
            </RpcProvider>
          </AssetsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ApolloProvider>
  )
}

/**
 * Vite Preload Error Handling
 * @see https://vitejs.dev/guide/build#load-error-handling
 */
window.addEventListener("vite:preloadError", () => {
  window.location.reload()
})
