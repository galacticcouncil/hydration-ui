import { SubmittableExtrinsic } from "@polkadot/api/types"

export function sendUnsignedTx(
  unsignedTx: SubmittableExtrinsic<"promise">,
  options: {
    onSubmitted?: () => void
    onSuccess?: () => void
    onError?: (error: Error) => void
  } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      unsignedTx.send((result) => {
        options.onSubmitted?.()
        if (result.isCompleted) {
          options.onSuccess?.()
          resolve()
        }

        if (result.dispatchError) {
          const err = new Error(result.dispatchError.toString())
          options.onError?.(err)
          reject(err)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}
