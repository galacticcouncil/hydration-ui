import { hydrationNext } from "@galacticcouncil/descriptors"
import {
  metadata as metadataCodec,
  V15,
} from "@polkadot-api/substrate-bindings"
import { TypedApi } from "polkadot-api"

import { formatPascalCaseToSentence } from "./formatting"

type DryRunExecutionError = Extract<
  Extract<
    Awaited<
      ReturnType<
        TypedApi<typeof hydrationNext>["apis"]["DryRunApi"]["dry_run_call"]
      >
    >,
    { success: true }
  >["value"]["execution_result"],
  { success: false }
>["value"]["error"]

export type DryRunError = {
  readonly name: string
  readonly description?: string
}

export const parseDryRunError = async (
  error: DryRunExecutionError | string,
): Promise<DryRunError | undefined> => {
  if (typeof error === "string") {
    const [type, name] = error.split(".")

    if (!type || !name) {
      return undefined
    }

    const parsedError = await getError(type, name)

    if (!parsedError) {
      return { name: formatPascalCaseToSentence(name) }
    }

    return parsedError
  }

  if (error.type === "Module") {
    return await getError(error.value.type, error.value.value?.type ?? "")
  }
}

const getError = async (
  type: string,
  name: string,
): Promise<DryRunError | undefined> => {
  const metadataBytes = await hydrationNext.getMetadata()
  const { metadata } = metadataCodec.dec(metadataBytes)
  const { pallets, lookup } = metadata.value as V15

  const palletByName = new Map(pallets.map((p) => [p.name, p] as const))
  const lookupById = new Map(lookup.map((t) => [t.id, t] as const))

  const pallet = palletByName.get(type)

  if (!pallet?.errors) {
    return
  }

  const errorType = lookupById.get(pallet.errors)

  if (!errorType || errorType.def.tag !== "variant") {
    return
  }

  const dryRunError = errorType.def.value.find((v) => v.name === name)

  return (
    dryRunError && {
      name: dryRunError.docs[0],
      description: dryRunError.docs[2],
    }
  )
}
