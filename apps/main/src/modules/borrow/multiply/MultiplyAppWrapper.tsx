import { useQuery } from "@tanstack/react-query"

import { createProxyFeesQuery, useAccountProxies } from "@/api/proxy"
import {
  MultiplyApp,
  MultiplyAppProps,
} from "@/modules/borrow/multiply/MultiplyApp"
import { MultiplyAppSkeleton } from "@/modules/borrow/multiply/MultiplyAppSkeleton"
import { useRpcProvider } from "@/providers/rpcProvider"

type MultiplyAppWrapperProps = Pick<
  MultiplyAppProps,
  "collateralReserve" | "debtReserve" | "strategy"
>

export const MultiplyAppWrapper = ({
  collateralReserve,
  debtReserve,
  strategy,
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
