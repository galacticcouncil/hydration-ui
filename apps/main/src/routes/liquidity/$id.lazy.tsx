import {
  createLazyFileRoute,
  Outlet,
  useLocation,
  useMatch,
  useParams,
} from "@tanstack/react-router"

import { PoolDetails } from "@/modules/liquidity/PoolDetails"

const Component = () => {
  const { id } = useParams({ from: "/liquidity/$id" })
  const location = useLocation()
  const match = useMatch({ from: "/liquidity/$id" })
  console.log(match)
  const isIdRoute = location.pathname === `/liquidity/${id}`

  return isIdRoute ? <PoolDetails /> : <Outlet />
}

export const Route = createLazyFileRoute("/liquidity/$id")({
  component: Component,
})
