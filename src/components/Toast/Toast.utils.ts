import { useQueries } from "@tanstack/react-query"
import { ToastData, useToast } from "state/toasts"
import { QUERY_KEYS } from "utils/queryKeys"
import { Buffer } from "buffer"
import { keccak256 } from "ethers/lib/utils"
import { omit } from "utils/rx"
import { differenceInMinutes } from "date-fns"

const getEvmTxHash = async (hash: string) => {
  const checkHashEndpoint = "https://hydradx.api.subscan.io/api/scan/check_hash"
  const body = JSON.stringify({
    hash,
  })

  const hashRes = await fetch(checkHashEndpoint, {
    method: "POST",
    body,
  })

  const hashDataRaw = await hashRes.json()

  try {
    const hashData = hashDataRaw?.data
    const extrinsicIndex = hashData?.extrinsic_index
    const hashType = hashData?.hash_type

    if (hashType !== "evm") return

    const xcmListEndpoint = "https://polkadot.api.subscan.io/api/scan/xcm/list"
    const xcmBody = JSON.stringify({
      extrinsic_index: extrinsicIndex,
      message_type: "transfer",
      row: 1,
    })

    const xcmRes = await fetch(xcmListEndpoint, {
      method: "POST",
      body: xcmBody,
    })
    const xcmListData = await xcmRes.json()

    const tx = xcmListData?.data?.list?.[0]

    const destExtrinsicIndex = tx.dest_extrinsic_index
    const destBlockNumber = destExtrinsicIndex.split("-")?.[0]
    const toAccountId = tx.to_account_id

    const moonbeamEvmTxEndpoint =
      "https://moonbeam.api.subscan.io/api/scan/evm/v2/transactions"
    const body = JSON.stringify({
      address: toAccountId,
      block_num: Number(destBlockNumber),
    })

    const evmTxRes = await fetch(moonbeamEvmTxEndpoint, {
      method: "POST",
      body,
    })

    const evmTxDataRaw = await evmTxRes.json()
    const evmTxData = evmTxDataRaw?.data?.list?.[0]

    const hash = evmTxData.hash
    const isMoonbeamSuccess = evmTxData.success

    return { hash, isMoonbeamSuccess }
  } catch (e) {
    throw new Error(`Hash ${hash} doesn't exist`)
  }
}

export const useBridgeToast = (toasts: ToastData[]) => {
  const toast = useToast()

  useQueries({
    queries: toasts.map((toastData) => ({
      queryKey: QUERY_KEYS.bridgeLink(toastData.id),
      queryFn: async () => {
        const chainKey = toastData.bridge as string
        const url = new URL(toastData.link as string)

        const diffInMinutes = differenceInMinutes(
          new Date(),
          new Date(toastData.dateCreated),
        )

        if (chainKey === "ethereum") {
          if (diffInMinutes > 45) {
            toast.remove(toastData.id)
            toast.add("unknown", omit(["bridge"], toastData))
          }
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
              toast.remove(toastData.id)
              toast.add("success", omit(["bridge"], toastData))
            }

            return true
          } catch {}
          return false
        } else {
          if (diffInMinutes > 2) {
            toast.remove(toastData.id)
            toast.add("unknown", omit(["bridge"], toastData))
          }

          const hash = url.pathname.split("/").slice(-1)[0]

          try {
            const evmTx = await getEvmTxHash(hash)

            if (evmTx?.isMoonbeamSuccess === false && evmTx.hash) {
              toast.remove(toastData.id)
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
              toast.edit(toastData.id, {
                link: `https://wormholescan.io/#/tx/${evmTx.hash}`,
                bridge: "ethereum",
              })
            }
          } catch (error) {
            toast.remove(toastData.id)
            toast.add("unknown", omit(["bridge"], toastData))
          }
        }

        return false
      },
      enabled: !!toastData.id && !!toastData.link,
      refetchInterval: toastData.bridge === "ethereum" ? 60000 : 30000,
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
    payload: payload ? Buffer.from(payload).toString("hex") : null,
    hash: keccak256(body),
  }
}
