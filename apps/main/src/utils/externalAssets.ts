import { Asset, findNestedKey } from "@galacticcouncil/sdk"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AnyChain, AnyParachain, Parachain } from "@galacticcouncil/xcm-core"
import { HydradxRuntimeXcmAssetLocation } from "@polkadot/types/lookup"
import { XcmV3Junction } from "@polkadot/types/lookup"
import { XcmV3Junctions } from "@polkadot-api/descriptors"
//import { assethub, pendulum } from "api/external"
import { Buffer } from "buffer"

import { AssetType } from "@/api/assets"
import { TAssetData } from "@/api/assets"

export const ASSETHUB_ID_BLACKLIST = [
  "34",
  "41",
  "43",
  "47",
  "49",
  "52",
  "53",
  "54",
  "65",
  "73",
  "74",
  "75",
  "92",
  "92",
  "97",
  "22222000",
  "22222001",
  "22222002",
  "22222003",
  "22222004",
  "50000019",
  "50000030",
  "50000031",
  "50000032",
  "50000033",
  "50000034",
]

export const assethub = chainsMap.get("assethub") as Parachain
export const pendulum = chainsMap.get("pendulum") as Parachain

const chainsById = new Map(
  Array.from(chainsMap.values()).map((chain) => [
    chain instanceof Parachain ? chain.parachainId : chain.id,
    chain,
  ]),
)

export const getAssetOrigin = (asset: TAssetData): AnyChain | null => {
  if (
    (asset.type !== AssetType.TOKEN && asset.type !== AssetType.External) ||
    !asset.parachainId
  ) {
    return null
  }

  return chainsById.get(Number(asset.parachainId)) ?? null
}

export type TExternalAsset = {
  id: string
  decimals: number
  symbol: string
  name: string
  origin: number
  supply?: string
  isWhiteListed: boolean
}

export type TRegisteredAsset = Omit<TExternalAsset, "supply"> & {
  internalId: string
}

export type TExternalAssetWithLocation = TExternalAsset & {
  location?: HydradxRuntimeXcmAssetLocation
}

export type InteriorTypes = {
  [x: string]: InteriorProp[]
}

export type InteriorProp = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in XcmV3Junction["type"]]: { [P in K]: any }
}[XcmV3Junction["type"]]

export type TExternalAssetInput = {
  parents: number
  interior: XcmV3Junctions
}

export const PARACHAIN_CONFIG: {
  [x: number]: {
    palletInstance: string
    network: string
    parents: number
    interior: HydradxRuntimeXcmAssetLocation["interior"]["type"]
  }
} = {
  [assethub.parachainId]: {
    palletInstance: "50",
    network: "polkadot",
    parents: 1,
    interior: "X3",
  },
}

export const isGeneralKey = (
  prop: InteriorProp,
): prop is { GeneralKey: string } => {
  return typeof prop !== "string" && "GeneralKey" in prop
}

export const getParachainInputData = (
  asset: TExternalAssetWithLocation,
): TExternalAssetInput => {
  const config = PARACHAIN_CONFIG[asset.origin]
  if (!config) throw new Error("Parachain config not found")

  const { parents, palletInstance } = config
  return {
    parents,
    interior: {
      type: "X3",
      value: [
        {
          type: "Parachain",
          value: asset.origin,
        },
        {
          type: "PalletInstance",
          value: +palletInstance,
        },
        {
          type: "GeneralIndex",
          value: BigInt(asset.id),
        },
      ],
    },
  }
}

export const getPendulumInputData = (
  location: HydradxRuntimeXcmAssetLocation,
): TExternalAssetInput => {
  const interiorType = location.interior.type
  const interiorValue = location.interior.value

  if (interiorType !== "Here") {
    const interior = location.interior[
      `as${interiorType}`
    ].toHuman() as InteriorProp[]

    const newInteriorType = `X${Number(interiorType.slice(1)) + 1}`

    return {
      parents: 1,
      interior: {
        type: newInteriorType,
        value: {
          type: "Parachain",
          value: pendulum.parachainId,
          ...interior,
        },
      } as XcmV3Junctions,
    }
  } else {
    return {
      parents: location.parents.toNumber(),
      interior: {
        type: interiorType,
        value: interiorValue.toJSON(),
      } as XcmV3Junctions,
    }
  }
}

export const getInputData = (
  asset: TExternalAssetWithLocation,
): TExternalAssetInput | undefined => {
  if (asset.origin === pendulum.parachainId && asset.location) {
    return getPendulumInputData(asset.location)
  }

  return getParachainInputData(asset)
}

export const getPendulumAssetIdFromGeneralKey = (generalKey: {
  length?: number
  data?: string
}) => {
  if (!generalKey || !generalKey.length || !generalKey.data) return undefined

  const bytes = Buffer.from(generalKey.data.slice(2), "hex")

  return `0x${bytes.slice(0, generalKey.length).toString("hex")}`
}

const getParachainId = (asset: Asset) => {
  const entry = findNestedKey(asset.location, "parachain")
  return entry && entry.parachain
}

const getGeneralIndex = (asset: Asset) => {
  const entry = findNestedKey(asset.location, "generalIndex")
  return entry && entry.generalIndex.toString()
}

const getGeneralKey = (asset: Asset): object => {
  const entry = findNestedKey(asset.location, "generalKey")
  return entry && entry.generalKey
}

export const getExternalId = (asset: Asset) => {
  const parachainId = getParachainId(asset)

  switch (parachainId) {
    case pendulum.parachainId: {
      const generalKey = getGeneralKey(asset)
      return getPendulumAssetIdFromGeneralKey(generalKey)
    }
    case assethub.parachainId:
      return getGeneralIndex(asset)
    default:
      return undefined
  }
}

export const isAnyParachain = (chain: AnyChain): chain is AnyParachain =>
  (chain as AnyParachain).parachainId !== undefined
