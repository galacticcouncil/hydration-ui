import {
  createFileRoute,
  Outlet,
  useLocation,
  useParams,
} from "@tanstack/react-router"
import z from "zod/v4"

import { PoolDetails } from "@/modules/liquidity/PoolDetails"
import { PoolDetailsSkeleton } from "@/modules/liquidity/PoolDetailsSkeleton"

const searchSchema = z.object({
  expanded: z.boolean().optional(),
  omnipoolPage: z.number().optional(),
  isolatedPage: z.number().optional(),
})

const Component = () => {
  const { id } = useParams({ from: "/liquidity/$id" })
  const location = useLocation()

  const isIdRoute = location.pathname === `/liquidity/${id}`

  return isIdRoute ? <PoolDetails id={id} /> : <Outlet />
}

export const Route = createFileRoute("/liquidity/$id")({
  component: Component,
  pendingComponent: PoolDetailsSkeleton,
  validateSearch: searchSchema,
})
