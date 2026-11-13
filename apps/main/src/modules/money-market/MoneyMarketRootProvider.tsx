import { markets } from "@galacticcouncil/money-market/core"
import { MoneyMarketProvider } from "@galacticcouncil/money-market/react"
import { FC, PropsWithChildren, useMemo } from "react"

import { createMoneyMarketConfig } from "@/modules/money-market/config"
import { DEFAULT_MARKET } from "@/modules/money-market/hooks"
import { useRpcProvider } from "@/providers/rpcProvider"

/**
 * The one place the money-market config is created. Mounting it reads
 * nothing: the transport only speaks when a package hook queries. Pages that
 * need another market nest a `MoneyMarketProvider` reusing this config.
 */
export const MoneyMarketRootProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const { papiClient } = useRpcProvider()
  const config = useMemo(
    () => createMoneyMarketConfig(papiClient),
    [papiClient],
  )

  return (
    <MoneyMarketProvider config={config} market={markets[DEFAULT_MARKET]}>
      {children}
    </MoneyMarketProvider>
  )
}
