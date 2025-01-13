import { queryOptions } from "@tanstack/react-query"
import { isNonNullish } from "remeda"

import { TProviderContext } from "@/providers/rpcProvider"
import { useAssetRegistry } from "@/states/assetRegistry"

export const assetsQuery = (data: TProviderContext) => {
  const { rpcUrlList = [], assetClient, tradeRouter, api } = data

  return queryOptions({
    queryKey: ["assets", rpcUrlList.join(",")],
    queryFn:
      assetClient && tradeRouter
        ? async () => {
            const { sync, syncShareTokens } = useAssetRegistry.getState()

            const [tradeAssets, assets] = await Promise.all([
              tradeRouter.getAllAssets(),
              assetClient.getOnChainAssets(true),
            ])

            const syncData = assets.map((asset) => {
              const isTradable = tradeAssets.some(
                (tradeAsset) => tradeAsset.id === asset.id,
              )

              return {
                ...asset,
                symbol: asset.symbol ?? "",
                decimals: asset.decimals ?? 0,
                name: asset.name ?? "",
                externalId: undefined, // getExternalId(asset),
                isTradable,
              }
            })
            console.log({ syncData })
            sync(syncData)

            const [shareToken, poolAssets] = await Promise.all([
              api.query.xyk.shareToken.entries(),
              api.query.xyk.poolAssets.entries(),
            ])

            const shareTokens = shareToken
              .map(([key, shareTokenIdRaw]) => {
                const poolAddress = key.args[0].toString()
                const shareTokenId = shareTokenIdRaw.toString()

                const xykAssets = poolAssets.find(
                  (xykPool) => xykPool[0].args[0].toString() === poolAddress,
                )?.[1]

                if (xykAssets)
                  return {
                    poolAddress,
                    shareTokenId,
                    assets: xykAssets.unwrap().map((asset) => asset.toString()),
                  }

                return undefined
              })
              .filter(isNonNullish)

            syncShareTokens(shareTokens)
            return [tradeAssets, assets]
          }
        : () => undefined,
    enabled: !!rpcUrlList.length && !!assetClient && !!tradeRouter,
    retry: false,
    refetchOnWindowFocus: false,
  })
}
