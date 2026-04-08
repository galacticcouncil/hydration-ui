import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmQueryParams } from "@/modules/xcm/transfer/utils/query"

type ParsedXcmQueryParams =
  | Pick<XcmFormValues, "srcChain" | "srcAsset" | "destChain" | "destAsset">
  | undefined

const parseQueryParams = (params: XcmQueryParams): ParsedXcmQueryParams => {
  const {
    srcChain: srcChainKey,
    srcAsset: srcAssetKey,
    destChain: destChainKey,
    destAsset: destAssetKey,
  } = params

  if (!srcChainKey || !srcAssetKey || !destChainKey || !destAssetKey) {
    return undefined
  }

  const srcChain = chainsMap.get(srcChainKey)
  const destChain = chainsMap.get(destChainKey)

  if (!srcChain || !destChain) {
    return undefined
  }

  const srcAssetData = srcChain.assetsData.get(srcAssetKey)
  const destAssetData = destChain.assetsData.get(destAssetKey)

  if (!srcAssetData?.asset || !destAssetData?.asset) {
    return undefined
  }

  return {
    srcChain,
    srcAsset: srcAssetData.asset,
    destChain,
    destAsset: destAssetData.asset,
  }
}

export const useXcmQueryParams = (override?: XcmQueryParams) => {
  const navigate = useNavigate()

  const searchParams = useSearch({
    from: "/cross-chain/",
    shouldThrow: false,
  })

  const parsedQueryParams = useMemo(() => {
    if (override) return parseQueryParams(override)
    return searchParams ? parseQueryParams(searchParams) : undefined
  }, [override, searchParams])

  const updateQueryParams = useCallback(
    (values: XcmQueryParams) => {
      if (override) return
      navigate({
        to: ".",
        search: values,
        resetScroll: false,
        replace: true,
      })
    },
    [navigate, override],
  )

  return {
    parsedQueryParams,
    updateQueryParams,
  }
}
