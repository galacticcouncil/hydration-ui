import { Asset } from "@galacticcouncil/sdk-next"
import { isAnyParachain } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AnyChain, AnyParachain, Parachain } from "@galacticcouncil/xcm-core"
import {
  HydradxRuntimeXcmAssetLocation,
  XcmV3Junction,
} from "@polkadot/types/lookup"
//import { assethub, pendulum } from "api/external"
import { Buffer } from "buffer"
import { FixedSizeBinary } from "polkadot-api"

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

const chains = Array.from(chainsMap.values())

export const getAssetOrigin = (asset: TAssetData): AnyChain | null => {
  const assetParachain =
    "parachainId" in asset ? Number(asset.parachainId) : null

  if (!assetParachain) {
    return null
  }

  return (
    chains.find(
      (chain): chain is AnyParachain =>
        isAnyParachain(chain) && chain.parachainId === assetParachain,
    ) ?? null
  )
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
  parents: string
  interior: InteriorTypes | string
}

export const PARACHAIN_CONFIG: {
  [x: number]: {
    palletInstance: string
    network: string
    parents: string
    interior: HydradxRuntimeXcmAssetLocation["interior"]["type"]
  }
} = {
  [assethub.parachainId]: {
    palletInstance: "50",
    network: "polkadot",
    parents: "1",
    interior: "X3",
  },
}

export const getParachainInputData = (asset: TExternalAssetWithLocation) => {
  const config = PARACHAIN_CONFIG[asset.origin]
  if (!config) throw new Error("Parachain config not found")

  const { parents, palletInstance } = config
  return {
    parents,
    interior: {
      X3: [
        {
          Parachain: asset.origin.toString(),
        },
        {
          PalletInstance: palletInstance,
        },
        {
          GeneralIndex: asset.id,
        },
      ],
    },
  }
}

export const getPendulumInputData = (
  location: HydradxRuntimeXcmAssetLocation,
): TExternalAssetInput => {
  const interiorType = location.interior.type

  if (interiorType !== "Here") {
    const interior = location.interior[
      `as${interiorType}`
    ].toHuman() as InteriorProp[]

    const newInteriorType = `X${Number(interiorType.slice(1)) + 1}`

    return {
      parents: "1",
      interior: {
        [newInteriorType]: [
          { Parachain: pendulum.parachainId.toString() },
          ...interior,
        ],
      },
    }
  } else {
    return {
      parents: location.parents.toString(),
      interior: interiorType,
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

type GeneralKeyType = {
  length?: number
  data?: FixedSizeBinary<32>
}

export const getPendulumAssetIdFromGeneralKey = (
  generalKey: GeneralKeyType,
) => {
  if (!generalKey || !generalKey.length || !generalKey.data) return undefined

  const hex = generalKey.data.asHex()
  const bytes = Buffer.from(hex.slice(2), "hex")
  return `0x${bytes.slice(0, generalKey.length).toString("hex")}`
}

const getLocationEntry = <T extends XcmV3Junction["type"]>(
  asset: Asset,
  type: T,
) => {
  if (!asset.location) return undefined
  const interiorType = asset.location.interior.type
  if (interiorType !== "Here" && interiorType !== "X1") {
    return asset.location.interior.value.find((l) => l.type === type)
  }
}

export const getParachainId = (asset: Asset) => {
  const entry = getLocationEntry(asset, "Parachain")
  return entry?.type === "Parachain" ? entry.value : undefined
}

export const getGeneralIndex = (asset: Asset) => {
  const entry = getLocationEntry(asset, "GeneralIndex")
  return entry?.type === "GeneralIndex" ? entry.value : undefined
}

export const getGeneralKey = (asset: Asset) => {
  const entry = getLocationEntry(asset, "GeneralKey")
  return entry?.type === "GeneralKey" ? entry.value : undefined
}

export const getEthereumNetworkEntry = (asset: Asset) => {
  const entry = getLocationEntry(asset, "GlobalConsensus")
  return entry?.type === "GlobalConsensus" && entry?.value.type === "Ethereum"
    ? entry.value
    : undefined
}

export const getAccountKey20 = (asset: Asset) => {
  const entry = getLocationEntry(asset, "AccountKey20")
  return entry?.type === "AccountKey20" ? entry.value : undefined
}

export const getExternalId = (asset: Asset) => {
  const parachainId = getParachainId(asset)

  switch (parachainId) {
    case pendulum.parachainId: {
      const generalKey = getGeneralKey(asset)
      return generalKey
        ? getPendulumAssetIdFromGeneralKey(generalKey)
        : undefined
    }
    case assethub.parachainId:
      return getGeneralIndex(asset)
    default:
      return undefined
  }
}
