import {
  AnyChain,
  Asset,
  AssetRoute,
  ConfigService,
} from "@galacticcouncil/xc-core"
import {
  ZcashTransfer,
  ZcashTransferArgs,
  ZcashTransfers,
} from "@galacticcouncil/xc-swap"

import type { XcmTransferArgs } from "@/api/xcm"
import { NEAR_CHAIN_KEY } from "@/modules/xcm/history/utils/journey"

/**
 * NEAR account 1Click refunds a zcash withdrawal to, if its payout fails or
 * the claim lands after the quote's deadline: our multisig, which returns it
 * to the sender by hand.
 */
export const ONE_CLICK_REFUND_ACCOUNT = "hydration.sputnik-dao.near"

export enum ZcashTransferKind {
  /** Hydration ZEC to Zcash: ntt to a 1Click deposit address on NEAR */
  Withdrawal = "Withdrawal",
  /** Zcash to Hydration ZEC: an Omni deposit, minted into the NEAR manager */
  Deposit = "Deposit",
}

/**
 * A pair the sdk's Zcash transfers serve, outside its route config.
 *
 * - Building the transfer's calls opens a deposit address, so they're built
 *   at submit only
 */
export type ZcashRoute = {
  readonly kind: ZcashTransferKind
  readonly source: { chain: AnyChain; asset: Asset }
  readonly destination: { chain: AnyChain; asset: Asset }
  /** Hydration ↔ NEAR ntt route the transfer rides, and whose tags it carries */
  readonly hub: AssetRoute
  readonly build: (args: ZcashTransferArgs) => Promise<ZcashTransfer>
}

type ZcashRouteKeys = Partial<
  Pick<XcmTransferArgs, "srcChain" | "srcAsset" | "destChain" | "destAsset">
>

/**
 * The Zcash pairs, each with its ntt route to NEAR. Without that route, as
 * when wormhole is disabled, the pair isn't offered.
 */
export const getZcashRoutes = (
  config: ConfigService,
  transfers: ZcashTransfers,
): ZcashRoute[] =>
  transfers.pairs.flatMap(({ source, destination }) => {
    const isWithdrawal = destination.chain.isZec()
    const [from, to, asset] = isWithdrawal
      ? [source.chain.key, NEAR_CHAIN_KEY, source.asset]
      : [NEAR_CHAIN_KEY, destination.chain.key, destination.asset]

    const hub = config.routes
      .get(from)
      ?.getRoutes()
      .find(
        (route) =>
          route.source.asset.key === asset.key &&
          route.destination.chain.key === to &&
          route.destination.asset.key === asset.key,
      )

    if (!hub) return []

    return [
      {
        kind: isWithdrawal
          ? ZcashTransferKind.Withdrawal
          : ZcashTransferKind.Deposit,
        source,
        destination,
        hub,
        build: (args) =>
          isWithdrawal ? transfers.withdraw(args) : transfers.deposit(args),
      },
    ]
  })

export const findZcashRoute = (
  routes: ZcashRoute[],
  { srcChain, srcAsset, destChain, destAsset }: ZcashRouteKeys,
): ZcashRoute | null =>
  routes.find(
    ({ source, destination }) =>
      source.chain.key === srcChain &&
      source.asset.key === srcAsset &&
      destination.chain.key === destChain &&
      destination.asset.key === destAsset,
  ) ?? null
