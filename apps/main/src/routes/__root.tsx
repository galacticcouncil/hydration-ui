import { Box, Button } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <h1>404 - Not Found</h1>
        <Link to="/">Homepage</Link>
      </div>
    )
  },
})

function RootComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <Box sx={{ maxWidth: 1240, m: "auto", p: 20 }}>
      <Box sx={{ position: "sticky", top: 0 }}>
        <Button
          size="small"
          outline={theme !== "light"}
          onClick={() => setTheme("light")}
        >
          light
        </Button>{" "}
        <Button
          size="small"
          outline={theme !== "dark"}
          onClick={() => setTheme("dark")}
        >
          dark
        </Button>
      </Box>
      <Box>
        <Link
          to="/"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>{" "}
        <Link
          to="/wallet"
          activeProps={{
            style: {
              textDecoration: "underline",
            },
          }}
        >
          Wallet
        </Link>{" "}
        <Link
          to="/liquidity"
          activeProps={{
            style: {
              textDecoration: "underline",
            },
          }}
        >
          Liquidity
        </Link>
      </Box>
      <Outlet />
      <ScrollRestoration />
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </Box>
  )
}
