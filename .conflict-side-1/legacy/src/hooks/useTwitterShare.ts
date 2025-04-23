import { useCallback } from "react"
import { qs } from "utils/formatting"

export function useTwitterShare({
  url,
  text,
  hashtags,
}: {
  url: string
  text?: string
  hashtags?: string[]
}) {
  return useCallback(() => {
    const querystring = qs({
      url,
      text,
      hashtags: hashtags?.map((tag) => tag.replace(/\s/gi, "")),
    })
    window?.open(`https://twitter.com/intent/tweet/${querystring}`, "_blank")
  }, [hashtags, text, url])
}
