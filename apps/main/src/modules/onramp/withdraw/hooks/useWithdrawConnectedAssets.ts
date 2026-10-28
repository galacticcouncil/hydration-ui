import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AssetAmount } from "@galacticcouncil/xc-core"
import { useQueries } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { accountBalancesQuery, useAccountBalanceFilter } from "@/api/balances"
import { getDepositSources } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useWithdrawDestinationOptions } from "@/modules/onramp/withdraw/hooks/useWithdrawDestinationOptions"
import { getWithdrawFundedAssets } from "@/modules/onramp/withdraw/WithdrawConnectedAssets.utils"
import { canUseWithdrawAccount } from "@/modules/onramp/withdraw/WithdrawOnchain.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetsPrice } from "@/states/displayAsset"

export const useWithdrawConnectedAssets = () => {
  const rpc = useRpcProvider()
  const filter = useAccountBalanceFilter()
  const accounts = useDepositAccounts({ signersOnly: true })
  const options = useWithdrawDestinationOptions()
  const { getAsset } = useAssets()
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
  const sources = useMemo(
    () =>
      hydration
        ? getDepositSources(accounts.filter(canUseWithdrawAccount), [
            {
              chain: hydration,
              assets: [
                ...new Map(
                  options.map((option) => [
                    option.sourceAssetKey,
                    option.sourceAsset,
                  ]),
                ).values(),
              ],
              routes: [],
              isTagSelect: false,
            },
          ])
        : [],
    [accounts, hydration, options],
  )
  const results = useQueries({
    queries: sources.map(({ account }) =>
      accountBalancesQuery(rpc, account.address, filter),
    ),
  })
  const funded = sources.flatMap((source, index) =>
    getWithdrawFundedAssets(options, results[index]?.data ?? {}, getAsset).map(
      (asset) => ({
        ...asset,
        key: `${source.key}:${asset.asset.key}`,
        source,
        balance: AssetAmount.fromAsset(asset.asset, {
          amount: asset.amount,
          decimals: asset.decimals,
        }),
      }),
    ),
  )
  const { getAssetPrice } = useAssetsPrice(funded.map((row) => row.assetId))
  const rows = funded
    .map((row) => {
      const price = getAssetPrice(row.assetId)
      return {
        ...row,
        value: price.isValid
          ? row.balance.toBigDecimal().times(price.price).toString()
          : undefined,
      }
    })
    .sort((a, b) => {
      if (a.value === undefined && b.value !== undefined) return 1
      if (a.value !== undefined && b.value === undefined) return -1
      return Big(b.value ?? 0).cmp(a.value ?? 0) || a.key.localeCompare(b.key)
    })
  return {
    hydration,
    rows,
    scanning: results.some((result) => result.isPending),
    failed: results.some((result) => result.isError),
  }
}
