import { Transfer, TransferBuilder, Wallet } from "@galacticcouncil/xc-sdk"

import type { XcmTransferArgs } from "@/api/xcm"
import { resolveAutomaticBridgeRoute } from "@/modules/xcm/transfer/utils/automaticRoute"
import { resolveRouteBuilderArgs } from "@/modules/xcm/transfer/utils/bridge"

export const buildXcmTransfer = async (
  wallet: Wallet,
  args: XcmTransferArgs,
): Promise<Transfer> => {
  const builder = TransferBuilder(wallet)
    .withAsset(args.srcAsset)
    .withSource(args.srcChain)
    .withDestination(args.destChain)

  if (!args.automaticBridgeSelection) {
    const { tag, destAsset } = resolveRouteBuilderArgs(
      builder.routes,
      args.destAsset,
      args.bridgeTag,
    )
    return builder.build({
      srcAddress: args.srcAddress,
      dstAddress: args.destAddress,
      dstAsset: destAsset,
      tag,
    })
  }

  const route = resolveAutomaticBridgeRoute(builder.routes, args.destAsset)
  if (!route) {
    throw new Error("No supported route for the selected destination asset")
  }

  const sourceChain = wallet.config.getChain(args.srcChain)
  const reversible =
    wallet.config.getAssetRoutesOrEmpty(
      route.destination.asset,
      route.destination.chain,
      sourceChain,
    ).length > 0

  // The SDK's generic Snowbridge tag matches both versions. Passing the exact
  // route through its public Wallet API keeps execution and presentation aligned.
  return wallet.getTransferData(
    { origin: { chain: sourceChain, route }, reversible },
    args.srcAddress,
    args.destAddress,
  )
}
