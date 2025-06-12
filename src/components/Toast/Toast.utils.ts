import { useQueries } from "@tanstack/react-query"
import { ToastData, useToast } from "state/toasts"
import { QUERY_KEYS } from "utils/queryKeys"
import { Buffer } from "buffer"
import { keccak256 } from "ethers/lib/utils"
import { omit } from "utils/rx"
import { differenceInHours, differenceInMinutes } from "date-fns"
import { useRpcProvider } from "providers/rpcProvider"
import request, { gql } from "graphql-request"
import { useIndexerUrl } from "api/provider"
import {
  EvmParachain,
  Parachain,
  SubstrateApis,
} from "@galacticcouncil/xcm-core"
import { chainsMap } from "@galacticcouncil/xcm-cfg"

const moonbeamRpc = (chainsMap.get("moonbeam") as Parachain).ws
const snowbridgeIndexer =
  "https://snowbridge.squids.live/snowbridge-subsquid-polkadot@v1/api/graphql"

// commented out xcm part to have implemnetation for the future when we can check a tarnsfer state
// {
//   const link = toastData.link

//   if (link) {
//     const network = extractKeyFromURL(link, toastData.xcm === "evm")

//     if (network) {
//       const isSubstrate = toastData.xcm === "substrate"
//       const endpoint = getSubscanEndpoint(
//         network,
//         isSubstrate ? "extrinsic" : "evm/transaction",
//       )

//       const body = JSON.stringify({
//         hash: toastData.txHash,
//         events_limit: 1,
//       })

//       const subscanRes = await fetch(endpoint, {
//         method: "POST",
//         body,
//       })

//       const resData = await subscanRes.json()

//       const tx = resData
//       const isFinalized = isSubstrate
//         ? !!tx.data?.finalized
//         : tx.data.success || tx.data["error_type"].length

//       if (tx?.data && isFinalized) {
//         toast.removeToast(toastData.id)

//         if (tx.data.success) {
//           toast.add("success", { ...toastData, hidden: isHiddenToast })
//         } else {
//           toast.add("error", { ...toastData, hidden: isHiddenToast })
//         }

//         return true
//       }

//       if (minutesDiff >= 5) {
//         toast.removeToast(toastData.id)
//         toast.add("unknown", { ...toastData, hidden: isHiddenToast })

//         return false
//       }
//     }
//   }

//   return false
// }

// const getSubscanEndpoint = (network: string, method: string) => {
//   return `https://${network}.api.subscan.io/api/scan/${method}`
// }

const extractKeyFromURL = (url: string, isEvm?: boolean) => {
  if (isEvm) {
    const origin = new URL(url)?.origin

    const chain = [...chainsMap.values()].find((chain) => {
      if (chain.isEvmParachain()) {
        return (
          (chain as EvmParachain).client.chain.blockExplorers?.default.url ===
          origin
        )
      }

      return false
    })

    return chain?.key
  }

  const match = url.match(/^https?:\/\/([^.]+)\.subscan/)
  return match ? match[1] : null
}

type TExtrinsic = {
  hash: string
  block: {
    height: string
  }
  indexInBlock: string
}

type TSuccessExtrinsic = TExtrinsic & {
  success: boolean
}

const getExtrinsicByHash = async (indexerUrl: string, hash: string) => {
  return {
    ...(await request<{
      extrinsics: TExtrinsic[]
    }>(
      indexerUrl,
      gql`
        query GetHash($hash: String!) {
          extrinsics(where: { hash_eq: $hash }) {
            hash
            block {
              height
            }
            indexInBlock
          }
        }
      `,
      { hash },
    )),
  }
}

const getExtrinsicByBlockNumber = async (
  indexerUrl: string,
  blockNumber: number,
) => {
  return {
    ...(await request<{
      extrinsics: TExtrinsic[]
    }>(
      indexerUrl,
      gql`
        query GetHash($blockNumber: Int) {
          extrinsics(
            where: {
              block: { height_eq: $blockNumber }
              AND: { call: { name_eq: "Ethereum.transact" } }
            }
          ) {
            indexInBlock
            hash
            block {
              height
            }
          }
        }
      `,
      { blockNumber },
    )),
  }
}

const getExtrinsic = async (indexerUrl: string, hash: string) => {
  return {
    ...(await request<{
      extrinsics: TSuccessExtrinsic[]
    }>(
      indexerUrl,
      gql`
        query GetExtrinsic($hash: String) {
          extrinsics(where: { hash_eq: $hash }) {
            hash
            block {
              height
            }
            indexInBlock
            success
          }
        }
      `,
      { hash },
    )),
  }
}

const getEvmExtrinsic = async (
  indexerUrl: string,
  blockNumber: number,
  index: number,
) => {
  return {
    ...(await request<{
      extrinsics: TSuccessExtrinsic[]
    }>(
      indexerUrl,
      gql`
        query GetEvmExtrinsic($blockNumber: Int, $index: Int) {
          extrinsics(
            where: {
              block: { height_eq: $blockNumber }
              indexInBlock_eq: $index
            }
          ) {
            success
            error
          }
        }
      `,
      { blockNumber, index },
    )),
  }
}

const getExtrinsicIndex = (
  { extrinsics }: { extrinsics: TExtrinsic[] },
  i?: number,
) => {
  const extrinsic = extrinsics?.length ? extrinsics[i ?? 0] : undefined

  if (!extrinsic) return undefined

  // get block details of extrinsic
  const blockNumber = extrinsic.block.height.toString()
  const index = extrinsic.indexInBlock.toString()

  return `${blockNumber}-${index}`
}

const getSnowbridgeStatusToPolkadot = async (txHash: string) => {
  return {
    ...(await request<{
      transferStatusToPolkadots: Array<{
        timestamp: string
        messageId: string
        status: 0 | 1 | 2
      }>
    }>(
      snowbridgeIndexer,
      gql`
        query SnowbridgeTransferStatus($hash: String!) {
          transferStatusToPolkadots(
            where: { messageId_eq: $hash, OR: { txHash_eq: $hash } }
          ) {
            status
            timestamp
            messageId
          }
        }
      `,
      { hash: txHash },
    )),
  }
}

const getSnowbridgeStatusToEth = async (txHash: string) => {
  return {
    ...(await request<{
      transferStatusToEthereums: Array<{
        timestamp: string
        messageId: string
        status: 0 | 1 | 2
      }>
    }>(
      snowbridgeIndexer,
      gql`
        query SnowbridgeTransferStatus($hash: String!) {
          transferStatusToEthereums(
            where: { messageId_eq: $hash, OR: { txHash_eq: $hash } }
          ) {
            status
            timestamp
            messageId
          }
        }
      `,
      { hash: txHash },
    )),
  }
}

const getWormholeTx = async (extrinsicIndex: string) => {
  // find xcm transfer
  const xcmListEndpoint =
    "https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/proxy/subscan/polkadot/xcm/list"
  const xcmBody = JSON.stringify({
    extrinsic_index: extrinsicIndex,
    message_type: "transfer",
    row: 1,
  })

  const xcmRes = await fetch(xcmListEndpoint, {
    method: "POST",
    body: xcmBody,
    headers: {
      "Content-type": "application/json",
    },
  })
  const xcmListData = await xcmRes.json()

  const tx = xcmListData?.data?.list?.[0]

  if (!tx) return undefined

  const destExtrinsicIndex = tx.dest_extrinsic_index
  const [destBlockNumber] = destExtrinsicIndex.split("-")
  const fromAccountId = tx.to_account_id

  const apiPool = SubstrateApis.getInstance()
  const moonbeamApi = await apiPool.api(moonbeamRpc)

  const txCount =
    await moonbeamApi.rpc.eth.getBlockTransactionCountByNumber(destBlockNumber)

  const moonbeamTxs = await Promise.all(
    [...Array(txCount.toNumber()).keys()].map((i) =>
      moonbeamApi.rpc.eth.getTransactionByBlockNumberAndIndex(
        destBlockNumber,
        i,
      ),
    ),
  )

  const wormholeTxHash = moonbeamTxs
    .find((tx) => tx.from.toString() === fromAccountId)
    ?.toHuman()

  if (destBlockNumber && fromAccountId && !wormholeTxHash) {
    return { hash: null, isMoonbeamSuccess: false }
  } else if (wormholeTxHash) {
    return { hash: wormholeTxHash.hash as string, isMoonbeamSuccess: true }
  }
}

export const useProcessToasts = (toasts: ToastData[]) => {
  const indexerUrl = useIndexerUrl()
  const toast = useToast()
  const { api, isLoaded } = useRpcProvider()

  useQueries({
    queries: toasts.map((toastData) => ({
      queryKey: QUERY_KEYS.progressToast(toastData.id),
      queryFn: async () => {
        const hoursDiff = differenceInHours(
          new Date(),
          new Date(toastData.dateCreated),
        )

        const minutesDiff = differenceInMinutes(
          new Date(),
          new Date(toastData.dateCreated),
        )

        const isHiddenToast = minutesDiff > 10
        const isXcm = !!toastData.xcm
        const isEvm =
          toastData.link?.includes("evm") ||
          toastData.link?.includes("explorer.nice.hydration.cloud")

        if (isXcm && toastData.link) {
          const parachain = extractKeyFromURL(toastData.link, !!isEvm)

          if (parachain !== "hydration") {
            toast.add("unknown", { ...toastData, hidden: true })

            return false
          }
        }

        // move to unknown state
        if (!toastData.txHash?.length) {
          toast.add("unknown", { ...toastData, hidden: true })

          return false
        }

        if (isEvm) {
          const ethTx = await api.rpc.eth.getTransactionByHash(toastData.txHash)

          if (ethTx) {
            const blockNumber = ethTx.blockNumber.toString()
            const indexInBlock = ethTx.transactionIndex.toString()

            const { extrinsics } = await getEvmExtrinsic(
              indexerUrl,
              Number(blockNumber),
              Number(indexInBlock),
            )

            if (!!extrinsics.length) {
              const isSuccess = extrinsics[0].success

              if (isSuccess) {
                toast.add("success", { ...toastData, hidden: isHiddenToast })
              } else {
                toast.add("error", { ...toastData, hidden: isHiddenToast })
              }

              return true
            }
          }

          return false
        } else {
          const res = await getExtrinsic(indexerUrl, toastData.txHash as string)

          const isExtrinsic = !!res.extrinsics.length

          if (isExtrinsic) {
            const isSuccess = res.extrinsics[0].success

            if (isSuccess) {
              toast.add("success", { ...toastData, hidden: isHiddenToast })
            } else {
              toast.add("error", { ...toastData, hidden: isHiddenToast })
            }

            return true
          }
        }

        // move to unknown state
        if (hoursDiff >= 1) {
          toast.add("unknown", { ...toastData, hidden: true })

          return false
        }

        return false
      },
      enabled: isLoaded,
      notifyOnChangeProps: [],
    })),
  })
}

export const useBridgeToast = (toasts: ToastData[]) => {
  const { api, isLoaded } = useRpcProvider()
  const indexerUrl = useIndexerUrl()
  const toast = useToast()

  useQueries({
    queries: toasts.map((toastData) => ({
      queryKey: QUERY_KEYS.bridgeLink(toastData.id),
      queryFn: async () => {
        if (!isLoaded) return null

        const { bridge, xcm, txHash, link, isHydraSource } = toastData

        const diffInMinutes = differenceInMinutes(
          new Date(),
          new Date(toastData.dateCreated),
        )

        const isHiddenToast = diffInMinutes > 10

        if (!txHash || !link) {
          toast.add(
            "unknown",
            omit(["bridge", "hidden"], {
              ...toastData,
              hidden: isHiddenToast,
            }),
          )

          return false
        }

        const isEvm =
          link.includes("evm") || link.includes("explorer.nice.hydration.cloud")

        const pullSnowbridgeToast = (status: number, messageId: string) => {
          if (status === 0 && !link.includes("snowbridge")) {
            toast.editToast(toastData.id, {
              txHash: messageId,
              link: `https://app.snowbridge.network/history#${messageId}`,
            })

            return true
          }

          if (status === 2) {
            toast.add(
              "error",
              omit(["bridge"], {
                ...toastData,
                link: `https://app.snowbridge.network/history#${messageId}`,
              }),
            )
            return true
          }

          if (status === 1) {
            toast.add(
              "success",
              omit(["bridge"], {
                ...toastData,
                link: `https://app.snowbridge.network/history#${messageId}`,
              }),
            )

            return true
          }
        }

        if (bridge === "Wormhole" && !isHydraSource) {
          const url = new URL(link)
          const hash = url.hash.split("/").slice(-1)[0]

          const res = await fetch(
            `https://api.wormholescan.io/api/v1/operations?txHash=${hash}`,
          )
          const data = await res.json()

          try {
            const vaa = data.operations?.[0]?.vaa?.raw
            const vaaBuffer = Buffer.from(vaa, "base64")
            const parsedVaa = parseVaa(vaaBuffer)

            if (parsedVaa) {
              toast.add(
                "success",
                omit(["bridge", "hidden"], {
                  ...toastData,
                  hidden: isHiddenToast,
                }),
              )
            }

            return true
          } catch {}
          return false
          // from hydration to eth (not supported by snowbridge indexer)
        } else if (bridge === "Snowbridge") {
          let hash =
            link.includes("snowbridge") || xcm === "evm" ? txHash : undefined

          if (!hash) {
            if (isEvm) {
              const ethTx = await api.rpc.eth.getTransactionByHash(txHash)

              const blockNumber = ethTx.blockNumber.toString()

              const extrinsics = await getExtrinsicByBlockNumber(
                indexerUrl,
                Number(blockNumber),
              )

              const extrinsic = extrinsics?.extrinsics.length
                ? extrinsics?.extrinsics[0]
                : undefined

              hash = extrinsic?.hash
            } else {
              const extrinsics = await getExtrinsicByHash(indexerUrl, txHash)
              const extrinsic = extrinsics?.extrinsics.length
                ? extrinsics?.extrinsics[0]
                : undefined

              hash = extrinsic?.hash
            }
          }

          if (hash) {
            if (isHydraSource) {
              const data = await getSnowbridgeStatusToEth(hash)

              const { status, messageId } = data.transferStatusToEthereums?.[0]

              pullSnowbridgeToast(status, messageId)
            } else {
              const data = await getSnowbridgeStatusToPolkadot(hash)

              const { status, messageId } = data.transferStatusToPolkadots?.[0]

              pullSnowbridgeToast(status, messageId)
            }
          }

          // from eth to hydration (only through evm wallet)
        } else if (bridge === "Wormhole" && isHydraSource) {
          if (diffInMinutes > 5) {
            toast.add(
              "unknown",
              omit(["bridge", "hidden"], {
                ...toastData,
                hidden: isHiddenToast,
              }),
            )
          }

          try {
            let extrinsicIndex
            if (isEvm) {
              // if hash is evm
              const ethTx = await api.rpc.eth.getTransactionByHash(txHash)
              const blockNumber = ethTx.blockNumber.toString()
              const transactionIndex = Number(ethTx.transactionIndex.toString())

              const extrinsic = await getExtrinsicByBlockNumber(
                indexerUrl,
                Number(blockNumber),
              )

              extrinsicIndex = getExtrinsicIndex(extrinsic, transactionIndex)
            } else {
              // if hash is substrate
              const extrinsic = await getExtrinsicByHash(indexerUrl, txHash)
              extrinsicIndex = getExtrinsicIndex(extrinsic)
            }

            if (!extrinsicIndex) return false

            const evmTx = await getWormholeTx(extrinsicIndex)

            if (evmTx?.isMoonbeamSuccess === false && evmTx.hash) {
              toast.add(
                "error",
                omit(["bridge"], {
                  ...toastData,
                  link: `https://moonbeam.subscan.io/tx/${evmTx.hash}`,
                }),
              )
            }
            if (evmTx?.isMoonbeamSuccess === true && evmTx.hash) {
              //udpate a link to show tx details on wormhole
              toast.editToast(toastData.id, {
                link: `https://wormholescan.io/#/tx/${evmTx.hash}`,
                xcm: "evm",
              })
            }
          } catch (error) {}
        }

        if (diffInMinutes > 70) {
          toast.add("unknown", omit(["bridge"], toastData))

          return false
        }

        return false
      },
      enabled: (!!toastData.id && !!toastData.link) || !isLoaded,
      refetchInterval: toastData.xcm === "evm" ? 60000 : 30000,
      notifyOnChangeProps: [],
    })),
  })
}

const parseVaa = (vaa: Uint8Array | Buffer) => {
  const signedVaa = Buffer.isBuffer(vaa) ? vaa : Buffer.from(vaa as Uint8Array)
  const sigStart = 6
  const numSigners = signedVaa[5]
  const sigLength = 66

  const guardianSignatures = []
  for (let i = 0; i < numSigners; ++i) {
    const start = sigStart + i * sigLength
    guardianSignatures.push({
      index: signedVaa[start],
      signature: signedVaa.subarray(start + 1, start + 66),
    })
  }

  const body = signedVaa.subarray(sigStart + sigLength * numSigners)
  const payload = body.subarray(51)

  return {
    version: signedVaa[0],
    guardianSetIndex: signedVaa.readUInt32BE(1),
    guardianSignatures,
    timestamp: body.readUInt32BE(0),
    nonce: body.readUInt32BE(4),
    emitterChain: body.readUInt16BE(8),
    emitterAddress: body.subarray(10, 42),
    sequence: body.readBigUInt64BE(42),
    consistencyLevel: body[50],
    payload: payload ? payload.toString("hex") : null,
    hash: keccak256(body),
  }
}
