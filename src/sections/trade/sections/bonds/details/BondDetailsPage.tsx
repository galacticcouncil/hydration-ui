import { BondDetailsSkeleton } from "./BondDetailsSkeleton"
import { BondDetailsData } from "./BondDetailsData"
import { useRpcProvider } from "providers/rpcProvider"

export const BondDetailsPage = () => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) return <BondDetailsSkeleton />

  return <BondDetailsData />
}
