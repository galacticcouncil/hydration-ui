import { Alert } from "@galacticcouncil/ui/components"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"

import { createProxyFeesQuery, useAccountProxies } from "@/api/proxy"
import { MULTIPLY_ASSETS_PAIRS } from "@/modules/borrow/multiply/config/pairs"
import {
  MultiplyApp,
  MultiplyAppProps,
} from "@/modules/borrow/multiply/MultiplyApp"
import { MultiplyAppSkeleton } from "@/modules/borrow/multiply/MultiplyAppSkeleton"
import { useRpcProvider } from "@/providers/rpcProvider"

type MultiplyAppWrapperProps = Pick<
  MultiplyAppProps,
  "collateralReserve" | "debtReserve"
>

export const MultiplyAppWrapper = ({
  collateralReserve,
  debtReserve,
}: MultiplyAppWrapperProps) => {
  const rpc = useRpcProvider()
  const { data: proxies = [], isLoading: isProxiesLoading } =
    useAccountProxies()
  const { data: proxyFees } = useQuery(createProxyFeesQuery(rpc))

  if (isProxiesLoading || !proxyFees) {
    return <MultiplyAppSkeleton />
  }

  const proxyCreationFee =
    proxyFees.proxyDepositBase +
    proxyFees.proxyDepositFactor * BigInt(proxies.length)

  const collateralAssetId = getAssetIdFromAddress(
    collateralReserve.underlyingAsset,
  )

  const strategy = MULTIPLY_ASSETS_PAIRS.find(
    (s) => s.collateralAssetId === collateralAssetId,
  )

  if (!strategy) {
    return <Alert variant="error" description="Strategy not found" />
  }

  return (
    <MultiplyApp
      collateralReserve={collateralReserve}
      debtReserve={debtReserve}
      proxies={proxies}
      proxyCreationFee={proxyCreationFee}
      strategy={strategy}
    />
  )
}
