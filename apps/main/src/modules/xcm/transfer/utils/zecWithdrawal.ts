import {
  HYDRATION_CHAIN_KEY,
  isAddressValidOnChain,
  isZecChain,
} from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AnyChain, Asset, AssetRoute } from "@galacticcouncil/xc-core"

import { NEAR_CHAIN_KEY } from "@/modules/xcm/history/utils/journey"
import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

const ZEC_ASSET_KEY = "zec"

/** Refunds 1Click's estimate while the NEAR account is not entered yet. */
export const ZEC_WITHDRAWAL_QUOTE_ACCOUNT = "hydration.sputnik-dao.near"

/**
 * ZEC from hydration to Zcash.
 *
 * - Sent over ntt to the user's NEAR account, then withdrawn by 1Click once
 *   the user claims it there
 */
export const isZecWithdrawal = (
  srcChain: AnyChain | null,
  srcAsset: Asset | null,
  destChain: AnyChain | null,
): boolean =>
  srcChain?.key === HYDRATION_CHAIN_KEY &&
  srcAsset?.key === ZEC_ASSET_KEY &&
  !!destChain &&
  isZecChain(destChain)

export const isNearAccount = (account: string | undefined): boolean => {
  const near = chainsMap.get(NEAR_CHAIN_KEY)
  return !!near && !!account && isAddressValidOnChain(account, near)
}

/** The NEAR zec routes, shown as a Zcash destination. */
export const toZecWithdrawalPair = (
  nearPair: ChainAssetPair,
  zcash: AnyChain,
): ChainAssetPair => ({
  chain: zcash,
  assets: nearPair.assets.filter((asset) => asset.key === ZEC_ASSET_KEY),
  routes: nearPair.routes
    .filter((route) => route.destination.asset.key === ZEC_ASSET_KEY)
    .map(
      (route) =>
        new AssetRoute({
          ...route,
          destination: { ...route.destination, chain: zcash },
        }),
    ),
  isTagSelect: false,
})

/** Values of the transfer actually sent: to the NEAR account. */
export const toRouteValues = (values: XcmFormValues): XcmFormValues => {
  const { srcChain, srcAsset, destChain, nearAccount } = values
  if (!isZecWithdrawal(srcChain, srcAsset, destChain)) return values

  return {
    ...values,
    destChain: chainsMap.get(NEAR_CHAIN_KEY) ?? null,
    destAddress: isNearAccount(nearAccount) ? (nearAccount ?? "") : "",
    destAccount: null,
  }
}
