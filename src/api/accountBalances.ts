import { AccountId32 } from "@polkadot/types/interfaces"
import { NATIVE_ASSET_ID } from "utils/api"
import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { QUERY_KEYS } from "utils/queryKeys"
import { useQuery } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { millisecondsInMinute } from "date-fns"
import { TBalance } from "./balances"
import { TAsset, TShareToken, useAssets } from "providers/assets"
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
  const { all, native, shareTokens } = useAssets()

  const { client } = sdk ?? {}
  const { balanceV2 } = client ?? {}

  return useQuery(
    QUERY_KEYS.accountBalances(address),
    async () => {
      if (!address) return

      const followedAssets: Array<TShareToken | TAsset> = [...shareTokens]
      const followedErc20Tokens = []

      for (const [, asset] of all) {
        if (!asset.isErc20 && asset.id !== NATIVE_ASSET_ID) {
          followedAssets.push(asset)
        } else if (asset.isErc20) {
          followedErc20Tokens.push(asset)
        }
      }

      const systemBalance = await balanceV2.getSystemBalance(address)
      const tokenBalance = await Promise.all(
        followedAssets.map(async (asset) => {
          const balance = await balanceV2.getTokenBalance(address, asset.id)

          return { balance, asset }
        }),
      )
      const erc20Balance = await Promise.all(
        followedErc20Tokens.map(async (asset) => {
          const balance = await balanceV2.getErc20Balance(address, asset.id)

          return { balance, asset }
        }),
      )

      const balances = [
        { balance: systemBalance, asset: native },
        ...tokenBalance,
        ...erc20Balance,
      ]

      const accountAssetsMap: Map<
        string,
        {
          balance: TBalance
          asset: TAsset | TShareToken
          isPoolPositions: boolean
        }
      > = new Map([])
      let isBalance = false

      for (const { balance, asset } of balances) {
        if (!BigNumber(balance.total).isZero()) {
          const isPoolPositions =
            asset.isShareToken ||
            asset.isStableSwap ||
            asset.id === GETH_ERC20_ASSET_ID

          if (isPoolPositions) {
            isBalance = true
          }

          accountAssetsMap.set(asset.id, {
            balance,
            asset,
            isPoolPositions,
          })
        }
      }

      return { accountAssetsMap, balances, isBalance }
    },
    {
      enabled: isLoaded && !!address && !!balanceV2,
      staleTime: millisecondsInMinute,
    },
  )
}
