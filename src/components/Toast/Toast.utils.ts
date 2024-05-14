import { useQueries } from "@tanstack/react-query"
import { ToastData, useToast } from "state/toasts"
import { QUERY_KEYS } from "utils/queryKeys"
import { Buffer } from "buffer"
import { keccak256 } from "ethers/lib/utils"
import { omit } from "utils/rx"

export const useBridgeToast = (toasts: ToastData[]) => {
  const toast = useToast()

  useQueries({
    queries: toasts.map((toastData) => ({
      queryKey: QUERY_KEYS.bridgeLink(toastData.id),
      queryFn: async () => {
        const url = new URL(toastData.link as string)
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
      },
      enabled: !!toastData.id && !!toastData.link,
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
