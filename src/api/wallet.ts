import { u8aToHex, hexToU8a } from "@polkadot/util"
import { decodeAddress } from "@polkadot/util-crypto"
import { useQuery } from "@tanstack/react-query"
import { gql, request } from "graphql-request"
import { QUERY_KEYS } from "utils/queryKeys"
import { useIndexerUrl } from "./provider"
import { getAddressVariants, safeConvertAddressSS58 } from "utils/formatting"
import { HYDRA_ADDRESS_PREFIX, NATIVE_ASSET_ID } from "utils/api"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { H160, isEvmAddress } from "utils/evm"
import { EIP1559Transaction } from "@polkadot/types/interfaces/eth"
import { Maybe } from "utils/helpers"
import { ApiPromise } from "@polkadot/api"
import { BN_NAN } from "utils/constants"
import { uniqBy } from "utils/rx"

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

type XcmParachainArgs = {
  data: {
    horizontalMessages: Array<[number, { data: string; sentAt: number }[]]>
  }
}

type XcmEvmArgs = {
  transaction: {
    value: EIP1559Transaction
    __kind: "EIP1559"
  }
}

type XcmTransferType = {
  name: string
  args: {
    who: string
    amount: string
    currencyId: number
  }
  call: {
    args: XcmParachainArgs | XcmEvmArgs
  }
  block: {
    timestamp: string
  }
  extrinsic: {
    hash: string
  }
}

const chains = Array.from(chainsMap.values())

const getChainById = (id: Maybe<number | string>) =>
  id ? chains.find((chain) => chain.parachainId === Number(id)) : null

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

const isAccountId32K = (
  value: TAccountId32 | TAccountKey20,
): value is TAccountId32 => {
  return value.__kind === "AccountId32"
}

const isAccountKey20 = (
  value: TAccountId32 | TAccountKey20,
): value is TAccountKey20 => {
  return value.__kind === "AccountKey20" && isEvmAddress(value.key)
}

const isXcmParachainTransfer = (
  args: XcmParachainArgs | XcmEvmArgs,
): args is XcmParachainArgs => {
  return !!(args as XcmParachainArgs)?.data?.horizontalMessages?.length
}

const isXcmEvmTransfer = (
  args: XcmParachainArgs | XcmEvmArgs,
): args is XcmEvmArgs => {
  return (args as XcmEvmArgs)?.transaction?.__kind === "EIP1559"
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
    if (isAccountId32K(value)) {
      return getAddressVariants(value.id).hydraAddress
    }

    if (isAccountKey20(value)) {
      return new H160(value.key).toAccount()
    }
  }

  return ""
}

const getDataFromEvmTx = (api: ApiPromise, tx: EIP1559Transaction) => {
  let currencyId = null
  let parachainId = null
  let dest = ""
  let amount = BN_NAN
  try {
    const data = api
      .createType("ExtrinsicV4", hexToU8a(tx.input.toString()))
      .toJSON() as {
      method: {
        args: {
          currency_id: number
          amount: string
          dest: {
            v2: {
              interior: {
                x2: {
                  parachain: number
                  accountKey20?: { key: string }
                  accountId32?: { id: string }
                }[]
              }
            }
          }
        }
      }
    }
    currencyId = data.method.args.currency_id
    parachainId = data.method.args.dest.v2.interior.x2[0].parachain

    const destInterior = data.method.args.dest.v2.interior.x2[1]

    const accountId32 = destInterior?.accountId32?.id
    const accountKey20 = destInterior?.accountKey20?.key

    dest = accountId32
      ? getAddressVariants(accountId32).hydraAddress
      : accountKey20 && isEvmAddress(accountKey20)
      ? new H160(accountKey20).toAccount()
      : ""
    amount = BN(data.method.args.amount)
  } catch {}

  return {
    currencyId,
    parachainId,
    dest,
    amount,
  }
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
        // covers internal deposit/withdrawal transfers and XCM deposit transfers
        calls: Array<TransferType>
        // covers  XCM deposits and EVM XCM withdrawal transfers
        events: XcmTransferType[]
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
            events(
              where: {
                name_in: ["Currencies.Deposited"]
                args_jsonContains: { who: $accountHash }
                call: { name_in: ["ParachainSystem.set_validation_data"] }
                OR: {
                  name_in: ["Tokens.Withdrawn"]
                  args_jsonContains: { who: $accountHash }
                  call: { name_in: ["Ethereum.transact"] }
                }
              }
              orderBy: block_height_DESC
            ) {
              name
              args
              call {
                args
                name
              }
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

  const { assets, isLoaded, api } = useRpcProvider()

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

        const events = data.events.map(
          ({ name, call, args, block, extrinsic }) => {
            let parachainId = null
            let sourceHydraAddress = null
            let destHydraAddress = null
            let currencyId = NATIVE_ASSET_ID
            let amount = BN_NAN

            if (isXcmParachainTransfer(call?.args)) {
              const msg = call.args?.data?.horizontalMessages.find(
                ([, data]) => {
                  return !!data?.length
                },
              )

              parachainId = msg?.[0]
              sourceHydraAddress = msg
                ? safeConvertAddressSS58(
                    `0x${msg?.[1]?.[0]?.data?.slice(-64)}`,
                    HYDRA_ADDRESS_PREFIX,
                  )
                : ""

              destHydraAddress = getAddressVariants(args.who).hydraAddress
              currencyId = args.currencyId?.toString() || NATIVE_ASSET_ID
              amount = BN(args.amount ?? 0)
            }

            if (isXcmEvmTransfer(call?.args)) {
              const evm = getDataFromEvmTx(api, call.args.transaction.value)
              parachainId = evm?.parachainId
              sourceHydraAddress = getAddressVariants(args.who).hydraAddress
              destHydraAddress = evm.dest
              currencyId = evm?.currencyId?.toString() ?? NATIVE_ASSET_ID
              amount = evm.amount
            }

            const type = name.toLowerCase().includes("deposited") ? "IN" : "OUT"

            const asset = assets.getAsset(currencyId)

            const iconIds =
              asset && assets.isStableSwap(asset)
                ? asset.assets
                : [asset?.id].filter(Boolean)

            return {
              type: type,
              source: type === "OUT" ? hydraAddress : sourceHydraAddress,
              dest: type === "IN" ? hydraAddress : destHydraAddress,
              sourceChain:
                type === "OUT"
                  ? chainsMap.get("hydradx")
                  : getChainById(parachainId),
              destChain:
                type === "IN"
                  ? chainsMap.get("hydradx")
                  : getChainById(parachainId),
              amount,
              date: new Date(block.timestamp),
              extrinsicHash: extrinsic.hash,
              asset,
              iconIds,
            }
          },
        )

        const calls = data.calls.map((transfer, index) => {
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
          }
        })

        const uniq = uniqBy(
          ({ extrinsicHash }) => extrinsicHash,
          [...events, ...calls],
        )
          .filter(({ amount }) => amount?.gte(0))
          .sort((a, b) => (a.date.getTime() > b.date.getTime() ? -1 : 1))

        return uniq
      },
    },
  )
}
