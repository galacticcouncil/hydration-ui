import { useMatchRoute } from "@tanstack/react-router"

import { HIDDEN_MOBILE_NAV_ROUTES } from "@/modules/layout/components/HeaderMenu.utils"

export const useHasMobNavbar = (): boolean => {
  const matchRoute = useMatchRoute()

  return !HIDDEN_MOBILE_NAV_ROUTES.some((to) => matchRoute({ to, fuzzy: true }))
}
