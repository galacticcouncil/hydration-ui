import { useCallback, useState } from "react"
import { useCopyToClipboard, useTimeoutFn } from "react-use"

export function useCopy(resetTimeoutMs = 0) {
  const [copied, setCopied] = useState(false)
  const [, copyToClipboard] = useCopyToClipboard()

  const [, cancel, reset] = useTimeoutFn(() => setCopied(false), resetTimeoutMs)

  const copy = useCallback(
    (text: string) => {
      copyToClipboard(text)
      setCopied(true)

      cancel()
      reset()
    },
    [copyToClipboard, cancel, reset],
  )

  return {
    copied,
    copy,
  }
}
