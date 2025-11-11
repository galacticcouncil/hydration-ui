import {
  createSdkContext,
  PoolService,
  SdkCtx,
  TradeRouter,
} from "@galacticcouncil/sdk"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { createContext, useContext } from "react"

import { useProviderRpcUrlStore } from "@/states/provider"

type LegacyProviderContextProps =
  | {
      legacy_api: ApiPromise
      legacy_sdk: SdkCtx
      legacy_poolService: PoolService
      legacy_tradeRouter: TradeRouter
      isLoaded: true
    }
  | {
      legacy_api: null
      legacy_sdk: null
      legacy_poolService: null
      legacy_tradeRouter: null
      isLoaded: false
    }

const defaultContext: LegacyProviderContextProps = {
  legacy_api: null,
  legacy_sdk: null,
  legacy_poolService: null,
  legacy_tradeRouter: null,
  isLoaded: false,
}

const LegacyProviderContext =
  createContext<LegacyProviderContextProps>(defaultContext)

export const useLegacyProvider = () => useContext(LegacyProviderContext)

export const LegacyProvider = ({ children }: { children: React.ReactNode }) => {
  const { rpcUrl, rpcUrlList, autoMode } = useProviderRpcUrlStore()

  const rpcProviderUrls = autoMode ? rpcUrlList : [rpcUrl]
  const { data, isSuccess } = useQuery({
    queryKey: ["legacy_api"],
    queryFn: async () => {
      const apiPool = SubstrateApis.getInstance()
      const legacy_api = await apiPool.api(rpcProviderUrls, 5)
      const legacy_sdk = createSdkContext(legacy_api)
      const {
        ctx: { pool: legacy_poolService },
        api: { router: legacy_tradeRouter },
      } = legacy_sdk

      return {
        legacy_api,
        legacy_sdk,
        legacy_poolService,
        legacy_tradeRouter,
      }
    },
  })

  return (
    <LegacyProviderContext.Provider
      value={
        isSuccess
          ? {
              legacy_api: data.legacy_api,
              legacy_sdk: data.legacy_sdk,
              legacy_poolService: data.legacy_poolService,
              legacy_tradeRouter: data.legacy_tradeRouter,
              isLoaded: true,
            }
          : defaultContext
      }
    >
      {children}
    </LegacyProviderContext.Provider>
  )
}
