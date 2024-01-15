import { u8aToHex } from "@polkadot/util"
import { decodeAddress } from "@polkadot/util-crypto"
import { useQuery } from "@tanstack/react-query"
import { gql, request } from "graphql-request"
import { QUERY_KEYS } from "utils/queryKeys"
import { useIndexerUrl } from "./provider"
import { getAddressVariants } from "utils/formatting"
import { NATIVE_ASSET_ID } from "utils/api"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { H160, isEvmAddress } from "utils/evm"

type InteriorParachainValueParachain = {
  value: number
  __kind: "Parachain"
}

type TAccountId32 = {
  id: string
  __kind: "AccountId32"
}

type TAccountKey20 = {
  key: string
  __kind: "AccountKey20"
}

type InteriorParachainValue = [
  InteriorParachainValueParachain,
  TAccountId32 | TAccountKey20,
]

type TransferParachainDest = {
  value: {
    parents: number
    interior: {
      value: InteriorParachainValue
    }
  }
}

type TransferPolkadotDest = {
  value: {
    parents: number
    interior: {
      value: TAccountId32
    }
  }
}

type TransferType = {
  args: {
    dest: string | TransferParachainDest
    amount?: string
    value?: string
    currencyId?: number
  }
  origin: {
    value: {
      value: string
    }
  }
  block: {
    timestamp: string
  }
  extrinsic: {
    hash: string
  }
}

const chains = Array.from(chainsMap.values())

const getChainById = (id: number | string) =>
  chains.find((chain) => chain.parachainId === Number(id))

const isParachainTransfer = (
  dest: string | TransferParachainDest | TransferPolkadotDest,
): dest is TransferParachainDest => {
  return typeof dest !== "string" && Array.isArray(dest.value.interior.value)
}

const isPolkadotTransfer = (
  dest: string | TransferParachainDest | TransferPolkadotDest,
): dest is TransferPolkadotDest => {
  return typeof dest !== "string" && !Array.isArray(dest.value.interior.value)
}

const isAccountId32 = (
  value: TAccountId32 | TAccountKey20,
): value is TAccountId32 => {
  return value.__kind === "AccountId32"
}

const isAccountKey20 = (
  value: TAccountId32 | TAccountKey20,
): value is TAccountKey20 => {
  return value.__kind === "AccountKey20" && isEvmAddress(value.key)
}

const getAddressFromDest = (dest: string | TransferParachainDest) => {
  if (typeof dest === "string") {
    return getAddressVariants(dest).hydraAddress
  }

  if (isPolkadotTransfer(dest)) {
    return getAddressVariants(dest.value.interior.value.id).hydraAddress
  }

  if (isParachainTransfer(dest)) {
    const [, value] = dest.value.interior.value
    if (isAccountId32(value)) {
      return getAddressVariants(value.id).hydraAddress
    }

    if (isAccountKey20(value)) {
      return new H160(value.key).toAccount()
    }
  }

  return ""
}

const getChainFromDest = (
  dest: string | TransferParachainDest | TransferPolkadotDest,
) => {
  if (!dest || typeof dest === "string") {
    return chainsMap.get("hydradx")
  }

  if (isPolkadotTransfer(dest)) {
    return chainsMap.get("polkadot")
  }

  if (isParachainTransfer(dest)) {
    const [{ value }] = dest.value.interior.value
    return getChainById(value)
  }
}

export const getAccountTransfers =
  (indexerUrl: string, accountHash: string) => async () => {
    return {
      ...(await request<{
        calls: Array<TransferType>
      }>(
        indexerUrl,
        gql`
          query AccountTransfers($accountHash: String!) {
            calls(
              where: {
                origin_jsonContains: { value: { value: $accountHash } }
                name_in: [
                  "Tokens.transfer_keep_alive"
                  "Tokens.transfer"
                  "Balances.transfer_keep_alive"
                  "Balances.transfer"
                  "XTokens.transfer"
                ]
                OR: {
                  name_in: [
                    "Tokens.transfer_keep_alive"
                    "Tokens.transfer"
                    "Balances.transfer_keep_alive"
                    "Balances.transfer"
                    "XTokens.transfer"
                  ]
                  args_jsonContains: { dest: $accountHash }
                }
              }
              orderBy: block_height_DESC
            ) {
              args
              name
              origin
              block {
                timestamp
              }
              extrinsic {
                hash
              }
            }
          }
        `,
        { accountHash },
      )),
    }
  }

export function useAccountTransfers(address: string, noRefresh?: boolean) {
  const indexerUrl = useIndexerUrl()

  const { assets, isLoaded } = useRpcProvider()

  const hydraAddress = address ? getAddressVariants(address).hydraAddress : ""
  const accountHash = address ? u8aToHex(decodeAddress(address)) : ""

  return useQuery(
    noRefresh
      ? QUERY_KEYS.accountTransfers(address)
      : QUERY_KEYS.accountTransfersLive(address),
    getAccountTransfers(indexerUrl, accountHash),
    {
      enabled: !!accountHash && isLoaded,
      select: (data) => {
        if (!data) return []

        return data.calls.map((transfer, index) => {
          const sourceHydraAddress = getAddressVariants(
            transfer.origin.value.value,
          ).hydraAddress

          const dest = transfer.args.dest

          const destHydraAddress = getAddressFromDest(dest)

          const type =
            hydraAddress.toLowerCase() === sourceHydraAddress.toLowerCase()
              ? "OUT"
              : "IN"

          const assetId =
            transfer.args?.currencyId?.toString() || NATIVE_ASSET_ID

          const amount = transfer.args?.amount ?? transfer.args?.value

          const asset = assets.getAsset(assetId)

          const iconIds =
            asset && assets.isStableSwap(asset)
              ? asset.assets
              : [asset?.id].filter(Boolean)

          return {
            type,
            source: type === "OUT" ? hydraAddress : sourceHydraAddress,
            dest: type === "IN" ? hydraAddress : destHydraAddress,
            sourceChain: chainsMap.get("hydradx"),
            destChain: getChainFromDest(dest),
            amount: BN(amount ?? 0),
            date: new Date(transfer.block.timestamp),
            extrinsicHash: transfer.extrinsic.hash,
            asset,
            iconIds,
            call: data.calls[index],
          }
        })
      },
    },
  )
}
