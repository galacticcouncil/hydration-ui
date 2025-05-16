import {
  createFileRoute,
  Outlet,
  useLocation,
  useParams,
} from "@tanstack/react-router"

import { PoolDetails } from "@/modules/liquidity/PoolDetails"

const Component = () => {
  const { id } = useParams({ from: "/liquidity/$id" })
  const location = useLocation()

  const isIdRoute = location.pathname === `/liquidity/${id}`

  return isIdRoute ? <PoolDetails /> : <Outlet />
}

export const Route = createFileRoute("/liquidity/$id")({
  component: Component,
})
