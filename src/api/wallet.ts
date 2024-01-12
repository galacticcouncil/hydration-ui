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

type TransferType = {
  block: {
    timestamp: string
  }
  extrinsic: {
    hash: string
    call: {
      args: {
        dest: string
        amount?: string
        value?: string
        currencyId?: number
      }
      origin: {
        value: {
          value: string
        }
      }
    }
  }
}

export const getAccountTransfers =
  (indexerUrl: string, accountHash: string) => async () => {
    // This is being typed manually, as GraphQL schema does not
    // describe the event arguments at all
    return {
      ...(await request<{
        events: Array<TransferType>
        calls: Array<TransferType>
      }>(
        indexerUrl,
        gql`
          query AccountTransfers($accountHash: String!) {
            events(
              orderBy: block_height_DESC
              where: {
                name_in: ["Balances.Withdraw"]
                extrinsic: {
                  call: {
                    name_in: [
                      "Tokens.transfer_keep_alive"
                      "Tokens.transfer"
                      "Balances.transfer_keep_alive"
                      "Balances.transfer"
                    ]
                  }
                }
                args_jsonContains: { who: $accountHash }
              }
            ) {
              block {
                timestamp
              }
              extrinsic {
                hash
                call {
                  args
                  origin
                }
              }
            }
            calls(
              orderBy: block_height_DESC
              where: {
                name_in: [
                  "Tokens.transfer_keep_alive"
                  "Tokens.transfer"
                  "Balances.transfer_keep_alive"
                  "Balances.transfer"
                ]
                args_jsonContains: { dest: $accountHash }
              }
            ) {
              block {
                timestamp
              }
              extrinsic {
                hash
                call {
                  args
                  origin
                }
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

        const { events, calls } = data
        const sorted = [...events, ...calls].sort(
          (a, b) =>
            new Date(b.block.timestamp).getTime() -
            new Date(a.block.timestamp).getTime(),
        )

        return sorted.map((transfer) => {
          const origin = getAddressVariants(
            transfer.extrinsic.call.origin.value.value,
          ).hydraAddress

          const dest = getAddressVariants(
            transfer.extrinsic.call.args.dest,
          ).hydraAddress

          const type =
            hydraAddress.toLowerCase() === dest.toLowerCase() ? "IN" : "OUT"

          const assetId =
            transfer.extrinsic.call.args?.currencyId?.toString() ||
            NATIVE_ASSET_ID

          const amount =
            transfer.extrinsic.call.args?.amount ??
            transfer.extrinsic.call.args?.value

          const asset = assets.getAsset(assetId)

          const iconIds =
            asset && assets.isStableSwap(asset) ? asset.assets : asset?.id || []

          return {
            from: type === "OUT" ? hydraAddress : origin,
            to: type === "IN" ? hydraAddress : dest,
            type,
            amount: BN(amount ?? 0),
            date: new Date(transfer.block.timestamp),
            extrinsicHash: transfer.extrinsic.hash,
            asset,
            iconIds,
          }
        })
      },
    },
  )
}
