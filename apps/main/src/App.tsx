import "@/i18n"

import { ThemeProvider } from "@galacticcouncil/ui"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"

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
        <RouterProvider router={router} />
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
