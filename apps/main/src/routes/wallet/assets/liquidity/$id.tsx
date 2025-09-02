import {
  createFileRoute,
  Outlet,
  useLocation,
  useParams,
} from "@tanstack/react-router"

import { PoolDetails } from "@/modules/liquidity/PoolDetails"

const Component = () => {
  const { id } = useParams({ from: "/wallet/assets/liquidity/$id" })
  const location = useLocation()

  const isIdRoute = location.pathname.endsWith(`/liquidity/${id}`)

  return isIdRoute ? <PoolDetails id={id} /> : <Outlet />
}

export const Route = createFileRoute("/wallet/assets/liquidity/$id")({
  component: Component,
})
