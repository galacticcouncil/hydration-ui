import { useMatchRoute } from "@tanstack/react-router"

const ROUTE_BLACKLIST = ["/liquidity/$id"] as const

export const useHasMobNavbar = (): boolean => {
  const matchRoute = useMatchRoute()

  return !ROUTE_BLACKLIST.some((to) => matchRoute({ to, fuzzy: true }))
}
