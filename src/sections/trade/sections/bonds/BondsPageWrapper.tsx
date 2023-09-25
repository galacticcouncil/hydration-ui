import { BondsPageSkeleton } from "./BondsPageSkeleton"
import { BondsPage } from "./BondsPage"
import { useRpcProvider } from "providers/rpcProvider"

export const BondsPageWrapper = () => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) {
    return <BondsPageSkeleton />
  }

  return <BondsPage />
}
