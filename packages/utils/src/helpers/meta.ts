import { hydration } from "@galacticcouncil/descriptors"
import {
  metadata as metadataCodec,
  V15,
} from "@polkadot-api/substrate-bindings"
import { PolkadotClient, TypedApi } from "polkadot-api"

import { formatPascalCaseToSentence } from "./formatting"

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

type Pallet = V15["pallets"][number]
type Lookup = V15["lookup"][number]

export type DryRunError = {
  readonly name: string
  readonly description?: string
}

export class DryRunErrorDecoder {
  readonly #papiClient: PolkadotClient

  #latestBlockHash = ""
  #palletByName: ReadonlyMap<string, Pallet> = new Map()
  #lookupById: ReadonlyMap<number, Lookup> = new Map()

  constructor(papiClient: PolkadotClient) {
    this.#papiClient = papiClient
  }

  public parseError = async (
    error: DryRunExecutionError | string,
  ): Promise<DryRunError | undefined> => {
    if (typeof error === "string") {
      const [type, name] = error.split(".")

      if (!type || !name) {
        return undefined
      }

      const parsedError = await this.getError(type, name)

      if (!parsedError) {
        return { name: formatPascalCaseToSentence(name) }
      }

      return parsedError
    }

    if (error.type === "Module") {
      return await this.getError(
        error.value.type,
        error.value.value?.type ?? "",
      )
    }
  }

  private getError = async (
    type: string,
    name: string,
  ): Promise<DryRunError | undefined> => {
    await this.updateMetadata()

    const pallet = this.#palletByName.get(type)

    if (!pallet?.errors) {
      return
    }

    const errorType = this.#lookupById.get(pallet.errors)

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

  private updateMetadata = async (): Promise<void> => {
    const finalizedBlock = await this.#papiClient.getFinalizedBlock()

    if (this.#latestBlockHash === finalizedBlock.hash) {
      return
    }

    this.#latestBlockHash = finalizedBlock.hash

    const metadataBytes = await this.#papiClient.getMetadata(
      finalizedBlock.hash,
    )

    const { metadata } = metadataCodec.dec(metadataBytes)
    const { pallets, lookup } = metadata.value as V15

    this.#palletByName = new Map(pallets.map((p) => [p.name, p] as const))
    this.#lookupById = new Map(lookup.map((t) => [t.id, t] as const))
  }
}
