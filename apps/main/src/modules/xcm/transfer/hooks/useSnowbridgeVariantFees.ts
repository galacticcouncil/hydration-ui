import { AssetAmount } from "@galacticcouncil/xc-core"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  useCrossChainWallet,
  xcmDestinationFeeQuery,
  XcmTransferArgs,
  xcmTransferQuery,
} from "@/api/xcm"
import { XcmTag } from "@/states/transactions"

export type SnowbridgeVariantFee = {
  sourceFee: AssetAmount | undefined
  bridgeFee: AssetAmount | undefined
  isLoading: boolean
  isError: boolean
}

export type SnowbridgeVariantFees = {
  slow: SnowbridgeVariantFee
  fast: SnowbridgeVariantFee
  refetch: () => void
}

const empty: SnowbridgeVariantFee = {
  sourceFee: undefined,
  bridgeFee: undefined,
  isLoading: false,
  isError: false,
}

const noop = () => {}

// Fetches a Transfer + estimated destination fee for both Snowbridge
// variants in parallel, so the selector can show real USD totals on both
// rows without the user having to flip between them.
export const useSnowbridgeVariantFees = (
  args: XcmTransferArgs | null,
  srcAmount: string,
): SnowbridgeVariantFees => {
  const wallet = useCrossChainWallet()

  const enabled =
    !!args &&
    !!args.srcAddress &&
    !!args.destAddress &&
    !!args.srcAsset &&
    !!args.destAsset

  const slowArgs = useMemo(
    () => (args ? { ...args, bridgeTag: XcmTag.Snowbridge } : null),
    [args],
  )
  const fastArgs = useMemo(
    () => (args ? { ...args, bridgeTag: XcmTag.SnowbridgeFast } : null),
    [args],
  )

  const slowTransfer = useQuery(xcmTransferQuery(wallet, slowArgs, { enabled }))
  const fastTransfer = useQuery(xcmTransferQuery(wallet, fastArgs, { enabled }))

  const slowDestFee = useQuery(
    xcmDestinationFeeQuery(slowTransfer.data ?? null, srcAmount, slowArgs),
  )
  const fastDestFee = useQuery(
    xcmDestinationFeeQuery(fastTransfer.data ?? null, srcAmount, fastArgs),
  )

  const refetch = () => {
    slowTransfer.refetch()
    fastTransfer.refetch()
    slowDestFee.refetch()
    fastDestFee.refetch()
  }

  if (!enabled) return { slow: empty, fast: empty, refetch: noop }

  // Hide totals only until both variants have resolved at least once.
  // Background refetches (e.g. when switching the active bridgeProvider)
  // leave keepPreviousData in place, so totals stay visible across switches.
  const isAnyPending =
    slowTransfer.isPending ||
    fastTransfer.isPending ||
    slowDestFee.isPending ||
    fastDestFee.isPending

  return {
    slow: {
      sourceFee: slowTransfer.data?.source.fee,
      bridgeFee: slowDestFee.data,
      isLoading: isAnyPending,
      isError: slowTransfer.isError || slowDestFee.isError,
    },
    fast: {
      sourceFee: fastTransfer.data?.source.fee,
      bridgeFee: fastDestFee.data,
      isLoading: isAnyPending,
      isError: fastTransfer.isError || fastDestFee.isError,
    },
    refetch,
  }
}
