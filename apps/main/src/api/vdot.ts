import { chainsMap } from "@galacticcouncil/xc-cfg"
import { Parachain } from "@galacticcouncil/xc-core"
import { queryOptions } from "@tanstack/react-query"
import { secondsToMilliseconds } from "date-fns"

import { assethub } from "@/api/external/assethub"
import { TProviderContext } from "@/providers/rpcProvider"

const bifrost = chainsMap.get("bifrost") as Parachain

export const VDOT_MINT_TOO_SMALL_ERROR = "vDOT mint: amount too small"

type VdotMintSupplyArgs = {
  address: string
  /** DOT in planck */
  amount: bigint
}

/**
 * DOT → Bifrost vDOT mint → money market supply, built by the SDK.
 *
 * Each build dry-runs the route on Hydration, Asset Hub and Bifrost, so it
 * re-quotes on a timer instead of every block.
 */
export const vdotMintSupplyQuery = (
  { sdk, isReady }: TProviderContext,
  { address, amount }: VdotMintSupplyArgs,
) =>
  queryOptions({
    queryKey: ["vdot", "mintSupply", address, amount.toString()],
    queryFn: () =>
      sdk.tx
        .vdotMintSupply(amount)
        .withBeneficiary(address)
        .withChains({ assetHub: assethub.client, bifrost: bifrost.client })
        .build(),
    enabled: isReady && !!address && amount > 0n,
    staleTime: secondsToMilliseconds(30),
    refetchInterval: secondsToMilliseconds(30),
    retry: false,
  })
