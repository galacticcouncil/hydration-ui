import { hydration } from "@galacticcouncil/descriptors"
import { IndexerErrorState } from "@galacticcouncil/indexer/squid/lib/parseIndexerErrorState"
import {
  metadata as metadataCodec,
  u32,
} from "@polkadot-api/substrate-bindings"
import { queryOptions } from "@tanstack/react-query"

import { GC_TIME, STALE_TIME } from "@/utils/consts"

type DecodedError = {
  readonly pallet: string
  readonly error: string
  readonly desc: string | undefined
}

const errorTypeId = (errors: unknown): number | undefined => {
  if (typeof errors === "number") {
    return errors
  }

  if (
    errors !== null &&
    typeof errors === "object" &&
    "type" in errors &&
    typeof errors.type === "number"
  ) {
    return errors.type
  }
}

const decodeModuleError = (
  metadataBytes: Uint8Array,
  palletIndex: number,
  errorHex: string,
): DecodedError | null => {
  const { metadata } = metadataCodec.dec(metadataBytes)
  const { pallets, lookup } = metadata.value as {
    pallets: Array<{
      index: number
      name: string
      errors?: unknown
    }>
    lookup: Array<{
      id: number
      def: {
        tag: string
        value: Array<{ index: number; name: string; docs: string[] }>
      }
    }>
  }

  const pallet = pallets.find((item) => item.index === palletIndex)

  if (!pallet) {
    return null
  }

  const lookupId = errorTypeId(pallet.errors)

  if (lookupId === undefined) {
    return null
  }

  const errorType = lookup.find((item) => item.id === lookupId)

  if (errorType?.def.tag !== "variant") {
    return null
  }

  const errorIndex = u32.dec(errorHex)
  const variant = errorType.def.value.find((item) => item.index === errorIndex)

  if (!variant) {
    return null
  }

  return {
    pallet: pallet.name,
    error: variant.name,
    desc: variant.docs[0],
  }
}

export const decodePjsErrorQuery = (
  errorState: IndexerErrorState | null | undefined,
) =>
  queryOptions({
    queryKey: ["errors", errorState],
    queryFn: async () => {
      if (!errorState) {
        return null
      }

      const metadataBytes = await hydration.getMetadata()

      return decodeModuleError(
        metadataBytes,
        errorState.index,
        errorState.error,
      )
    },
    enabled: !!errorState,
    gcTime: GC_TIME,
    staleTime: STALE_TIME,
  })
