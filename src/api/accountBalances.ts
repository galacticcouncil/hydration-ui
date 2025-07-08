import { AccountId32 } from "@polkadot/types/interfaces"
import { NATIVE_ASSET_ID } from "utils/api"
import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { QUERY_KEYS } from "utils/queryKeys"
import { useQuery } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { millisecondsInMinute } from "date-fns"
import { undefinedNoop } from "utils/helpers"
import { TBalance } from "./balances"
import { TAsset, useAssets } from "providers/assets"
import { GETH_ERC20_ASSET_ID } from "utils/constants"

export const getAccountAssetBalances =
  (
    api: ApiPromise,
    pairs: Array<[address: AccountId32 | string, assetId: u32 | string]>,
  ) =>
  async () => {
    const [tokens, natives] = await Promise.all([
      api.query.tokens.accounts.multi(
        pairs.filter(([_, assetId]) => assetId.toString() !== NATIVE_ASSET_ID),
      ),
      api.query.system.account.multi(
        pairs
          .filter(([_, assetId]) => assetId.toString() === NATIVE_ASSET_ID)
          .map(([account]) => account),
      ),
    ])

    const values: Array<{
      free: BigNumber
      reserved: BigNumber
      frozen: BigNumber
      assetId: string
    }> = []
    for (
      let tokenIdx = 0, nativeIdx = 0;
      tokenIdx + nativeIdx < pairs.length;

    ) {
      const idx = tokenIdx + nativeIdx
      const [, assetId] = pairs[idx]

      if (assetId.toString() === NATIVE_ASSET_ID) {
        values.push({
          assetId: assetId.toString(),
          free: natives[nativeIdx].data.free.toBigNumber(),
          reserved: natives[nativeIdx].data.reserved.toBigNumber(),
          frozen: natives[nativeIdx].data.frozen.toBigNumber(),
        })

        nativeIdx += 1
      } else {
        values.push({
          assetId: assetId.toString(),
          free: tokens[tokenIdx].free.toBigNumber(),
          reserved: tokens[tokenIdx].reserved.toBigNumber(),
          frozen: tokens[tokenIdx].frozen.toBigNumber(),
        })

        tokenIdx += 1
      }
    }

    return values
  }

export const useAccountBalance = (address?: string) => {
  const { isLoaded, sdk } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()

  const { client } = sdk ?? {}
  const { balanceV2 } = client ?? {}

  return useQuery(
    QUERY_KEYS.accountBalances(address),
    address
      ? async () => {
          const balances = await balanceV2.getAccountBalances(address)

          const accountAssetsMap: Map<
            string,
            { balance: TBalance; asset: TAsset; isPoolPositions: boolean }
          > = new Map([])
          let isBalance = false

          for (const balance of balances) {
            if (balance.total !== "0") {
              const asset = getAssetWithFallback(balance.assetId)

              const isPoolPositions =
                (asset.isShareToken ||
                  asset.isStableSwap ||
                  asset.id === GETH_ERC20_ASSET_ID) &&
                balance.total !== "0"

              if (isPoolPositions) {
                isBalance = true
              }

              accountAssetsMap.set(balance.assetId, {
                balance,
                asset,
                isPoolPositions,
              })
            }
          }

          return { accountAssetsMap, balances, isBalance }
        }
      : undefinedNoop,
    {
      enabled: isLoaded && !!address && !!balanceV2,
      staleTime: millisecondsInMinute,
    },
  )
}
