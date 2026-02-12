import { hydration } from "@galacticcouncil/descriptors"
import {
  metadata as metadataCodec,
  V15,
} from "@polkadot-api/substrate-bindings"
import { TypedApi } from "polkadot-api"

type DryRunExecutionError = Extract<
  Extract<
    Awaited<
      ReturnType<
        TypedApi<typeof hydration>["apis"]["DryRunApi"]["dry_run_call"]
      >
    >,
    { success: true }
  >["value"]["execution_result"],
  { success: false }
>["value"]["error"]

export type DryRunError = {
  readonly name: string
  readonly description: string | undefined
}

export const parseDryRunError = async (
  error: DryRunExecutionError,
): Promise<DryRunError | undefined> => {
  if (error.type !== "Module") {
    return
  }

  const metadataBytes = await hydration.getMetadata()
  const { metadata } = metadataCodec.dec(metadataBytes)
  const { pallets, lookup } = metadata.value as V15

  const palletByName = new Map(pallets.map((p) => [p.name, p] as const))
  const lookupById = new Map(lookup.map((t) => [t.id, t] as const))

  const pallet = palletByName.get(error.value.type)

  if (!pallet?.errors) {
    return
  }

  const errorType = lookupById.get(pallet.errors)

  if (!errorType || errorType.def.tag !== "variant") {
    return
  }

  const dryRunError = errorType.def.value.find(
    (v) => v.name === error.value.value?.type,
  )

  return (
    dryRunError && {
      name: dryRunError.name,
      description: dryRunError.docs[2],
    }
  )
}
