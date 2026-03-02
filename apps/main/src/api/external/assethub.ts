import { XcmV3Junction, XcmV3Junctions } from "@galacticcouncil/descriptors"
import { XcmV3Multilocation } from "@galacticcouncil/sdk-next"
import { invariant } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import {
  Asset,
  AssetAmount,
  multiloc,
  Parachain,
} from "@galacticcouncil/xc-core"

import { AnyPapiTx } from "@/modules/transactions/types"

export const assethub = chainsMap.get("assethub") as Parachain

export async function calculateAssethubFee(
  tx: AnyPapiTx,
  address: string,
  asset: Asset,
): Promise<bigint> {
  const assethub = chainsMap.get("assethub")
  invariant(assethub, "Assethub chain not found")

  const native = assethub.assetsData.get("dot")
  invariant(native, "Assethub native asset not found")

  const paymentInfo = await tx.getPaymentInfo(address)

  const feeAmount = (paymentInfo.partial_fee * 30n) / 10n // add 30% margin

  if (native.asset.isEqual(asset)) {
    return feeAmount
  }

  const feeQuote = await assethub.dex.getQuote(
    asset,
    native.asset,
    AssetAmount.fromAsset(native.asset, {
      amount: feeAmount,
      decimals: native.decimals!,
    }),
  )
  return feeQuote.amount
}

export const getAssetHubFeeAssetLocaction = (asset: Asset) => {
  const location = assethub.getAssetXcmLocation(asset)

  if (location && location.interior !== XcmV3Junctions.Here().type) {
    const pallet = multiloc.findPalletInstance(location)
    const index = multiloc.findGeneralIndex(location)

    return {
      parents: 0,
      interior: XcmV3Junctions.X2([
        XcmV3Junction.PalletInstance(Number(pallet)),
        XcmV3Junction.GeneralIndex(BigInt(index)),
      ]),
    } as XcmV3Multilocation
  }
}
