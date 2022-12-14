import { calculate_shares } from "@galacticcouncil/math/build/omnipool/bundler/hydra_dx_wasm"
import { u32 } from "@polkadot/types"
import { useAssetMeta } from "api/assetMeta"
import { useTokenBalance } from "api/balances"
import { useApiIds } from "api/consts"
import { useOmnipoolAsset, useOmnipoolFee } from "api/omnipool"
import { useSpotPrice } from "api/spotPrice"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { useAccountStore } from "state/store"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_10 } from "utils/constants"

export const useAddLiquidity = (assetId: u32 | string, assetValue?: string) => {
  const omnipoolBalance = useTokenBalance(assetId, OMNIPOOL_ACCOUNT_ADDRESS)
  const ommipoolAsset = useOmnipoolAsset(assetId)
  const { data: assetMeta } = useAssetMeta(assetId)

  const { data: apiIds } = useApiIds()
  const { data: spotPrice } = useSpotPrice(assetId, apiIds?.usdId)

  const { data: omnipoolFee } = useOmnipoolFee()

  const { account } = useAccountStore()
  const { data: assetBalance } = useTokenBalance(assetId, account?.address)

  const calculatedShares = useMemo(() => {
    if (ommipoolAsset.data && assetValue && assetMeta) {
      const { hubReserve, shares } = ommipoolAsset.data

      const assetReserve = omnipoolBalance.data?.balance.toString()
      const amount = BigNumber(assetValue)
        .multipliedBy(BN_10.pow(assetMeta.decimals.toNumber()))
        .toString()

      if (assetReserve && hubReserve && shares && amount) {
        return calculate_shares(
          assetReserve,
          hubReserve.toString(),
          shares.toString(),
          amount,
        )
      }
    }
    return null
  }, [omnipoolBalance, assetValue, ommipoolAsset, assetMeta])

  return { calculatedShares, spotPrice, omnipoolFee, assetMeta, assetBalance }
}
