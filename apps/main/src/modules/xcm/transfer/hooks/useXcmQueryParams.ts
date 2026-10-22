import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmQueryParams } from "@/modules/xcm/transfer/utils/query"

type ParsedXcmQueryParams = Partial<
  Pick<XcmFormValues, "srcChain" | "srcAsset" | "destChain" | "destAsset">
>

const parseQueryParams = (
  params: XcmQueryParams,
): ParsedXcmQueryParams | undefined => {
  const {
    srcChain: srcChainKey,
    srcAsset: srcAssetKey,
    destChain: destChainKey,
    destAsset: destAssetKey,
  } = params

  const parsed: ParsedXcmQueryParams = {}

  if (srcChainKey) {
    const srcChain = chainsMap.get(srcChainKey)
    if (!srcChain) return undefined

    parsed.srcChain = srcChain

    if (srcAssetKey) {
      const srcAsset = srcChain.assetsData.get(srcAssetKey)?.asset
      if (!srcAsset) return undefined
      parsed.srcAsset = srcAsset
    }
  }

  if (destChainKey && destAssetKey) {
    const destChain = chainsMap.get(destChainKey)
    const destAsset = destChain?.assetsData.get(destAssetKey)?.asset
    if (destChain && destAsset) {
      parsed.destChain = destChain
      parsed.destAsset = destAsset
    }
  }

  if (!parsed.srcChain && !parsed.destChain) {
    return undefined
  }

  return parsed
}

export const useXcmQueryParams = () => {
  const navigate = useNavigate()

  const searchParams = useSearch({
    from: "/cross-chain/",
    shouldThrow: false,
  })

  const parsedQueryParams = useMemo(
    () => (searchParams ? parseQueryParams(searchParams) : undefined),
    [searchParams],
  )

  const updateQueryParams = useCallback(
    (values: XcmQueryParams) => {
      navigate({
        to: ".",
        search: values,
        resetScroll: false,
        replace: true,
      })
    },
    [navigate],
  )

  return {
    parsedQueryParams,
    updateQueryParams,
  }
}
