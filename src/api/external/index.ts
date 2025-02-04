import { MetadataStore } from "@galacticcouncil/ui"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { useQuery } from "@tanstack/react-query"
import { useTotalIssuances } from "api/totalIssuance"
import SkullIcon from "assets/icons/SkullIcon.svg?react"
import WarningIcon from "assets/icons/WarningIcon.svg?react"
import WarningIconRed from "assets/icons/WarningIconRed.svg?react"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { Fragment, useCallback, useMemo } from "react"
import {
  TExternalAsset,
  TRegisteredAsset,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { HYDRATION_PARACHAIN_ID } from "utils/constants"
import { isAnyParachain, isNotNil } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { assethub, useAssetHubAssetRegistry } from "./assethub"
import { pendulum, usePendulumAssetRegistry } from "./pendulum"
import { usePolkadotRegistry } from "./polkadot"
import { useAssets } from "providers/assets"
import BigNumber from "bignumber.js"

export { assethub, pendulum }

export type RugSeverityLevel = "none" | "low" | "medium" | "high"
export const RUG_SEVERITY_LEVELS: RugSeverityLevel[] = [
  "none",
  "low",
  "medium",
  "high",
]
export const getIconByRugSeverity = (severity: RugSeverityLevel) => {
  switch (severity) {
    case "high":
      return SkullIcon
    case "medium":
      return WarningIconRed
    case "low":
      return WarningIcon
    default:
      return Fragment
  }
}

export type RugWarning = {
  type: "supply" | "symbol" | "name" | "decimals"
  severity: RugSeverityLevel
  diff: [number | string | BN, number | string | BN]
}

export const useExternalApi = (chainKey: string) => {
  const chain = chainsMap.get(chainKey)

  return useQuery(
    QUERY_KEYS.externalApi(chainKey),
    async () => {
      if (!chain) throw new Error(`Chain ${chainKey} not found`)
      if (!isAnyParachain(chain))
        throw new Error(`Chain ${chainKey} is not a parachain`)

      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(chain.ws)

      return api
    },
    {
      enabled: !!chain,
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours,
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
    },
  )
}

export const useExternalWhitelist = () => {
  return useQuery(
    QUERY_KEYS.externalStore,
    async () => MetadataStore.getInstance().externalWhitelist(),
    {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours,
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
    },
  )
}

/**
 * Used for fetching tokens from supported parachains
 */
export const useExternalAssetRegistry = (enabled?: boolean) => {
  const { isLoaded } = useRpcProvider()

  const queryEnabled =
    typeof enabled === "boolean" ? enabled && isLoaded : isLoaded

  const assethubRegistry = useAssetHubAssetRegistry(queryEnabled)
  const pendulumRegistry = usePendulumAssetRegistry(queryEnabled)

  return {
    [assethub.parachainId]: assethubRegistry,
    [pendulum.parachainId]: pendulumRegistry,
  }
}

export const useParachainAmount = (id: string) => {
  const chains = usePolkadotRegistry()

  const validChains = chains.data?.reduce<any[]>((acc, chain) => {
    // skip asst hub and hydra chains
    if (
      chain.paraID === assethub.parachainId ||
      chain.paraID === HYDRATION_PARACHAIN_ID
    )
      return acc

    const assets = chain.data

    const isAsset = assets.some((asset) => {
      try {
        return asset.currencyID === id
      } catch (error) {
        return false
      }
    })

    if (isAsset) {
      acc.push(chain)
    }

    return acc
  }, [])

  return { chains: validChains ?? [], amount: validChains?.length ?? 0 }
}

export type TRugCheckData = ReturnType<
  typeof useExternalTokensRugCheck
>["tokens"][number]

export const useExternalTokensRugCheck = (ids?: string[]) => {
  const { isLoaded } = useRpcProvider()
  const { external, externalInvalid, getAssetWithFallback } = useAssets()
  const { getTokenByInternalId, isRiskConsentAdded } =
    useUserExternalTokenStore()

  const assetRegistry = useExternalAssetRegistry()
  const { getIsWhiteListed } = useExternalAssetsWhiteList()

  const { data: issuanceData } = useTotalIssuances()

  const { internalIds } = useMemo(() => {
    const allExternal = [...external, ...externalInvalid]

    const externalAssets = isLoaded
      ? ids?.length
        ? ids.map((id) => allExternal.find((external) => external.id === id))
        : external
      : []

    const internalIds = externalAssets.reduce<string[]>((acc, asset) => {
      if (asset) acc.push(asset.id)

      return acc
    }, [])

    return { externalAssets, internalIds }
  }, [external, externalInvalid, ids, isLoaded])

  const tokens = useMemo(() => {
    if (!issuanceData) return []

    return internalIds
      .map((tokenId) => {
        const internalToken = getAssetWithFallback(tokenId)
        const storedToken = getTokenByInternalId(tokenId)
        const shouldIgnoreRugCheck = isRiskConsentAdded(internalToken.id)

        const externalAssetRegistry = internalToken.parachainId
          ? assetRegistry[+internalToken.parachainId]
          : null

        const externalToken = externalAssetRegistry?.data?.get(
          internalToken.externalId ?? "",
        )

        const issuance = issuanceData.get(tokenId)

        if (!externalToken) return null

        const totalSupplyExternal =
          !shouldIgnoreRugCheck && externalToken.supply
            ? externalToken.supply
            : null

        const totalSupplyInternal =
          !shouldIgnoreRugCheck && issuance ? issuance.toString() : null

        const warnings = createRugWarningList({
          totalSupplyExternal,
          totalSupplyInternal,
          storedToken,
          externalToken,
        })

        const severity = warnings.reduce((acc, { severity }) => {
          return RUG_SEVERITY_LEVELS.indexOf(severity) >
            RUG_SEVERITY_LEVELS.indexOf(acc)
            ? severity
            : acc
        }, "low" as RugSeverityLevel)

        const { isWhiteListed, badge } = getIsWhiteListed(internalToken.id)

        return {
          externalToken,
          totalSupplyExternal,
          internalToken,
          totalSupplyInternal,
          storedToken,
          warnings,
          severity,
          badge,
          isWhiteListed,
        }
      })
      .filter(isNotNil)
  }, [
    assetRegistry,
    getAssetWithFallback,
    getIsWhiteListed,
    getTokenByInternalId,
    internalIds,
    isRiskConsentAdded,
    issuanceData,
  ])

  const tokensMap = useMemo(() => {
    return new Map(tokens.map((token) => [token.internalToken.id, token]))
  }, [tokens])

  return {
    tokens,
    tokensMap,
  }
}

const createRugWarningList = ({
  totalSupplyExternal,
  totalSupplyInternal,
  storedToken,
  externalToken,
}: {
  totalSupplyExternal: string | null
  totalSupplyInternal: string | null
  externalToken: TExternalAsset
  storedToken?: TRegisteredAsset
}) => {
  const warnings: RugWarning[] = []

  if (
    totalSupplyExternal &&
    totalSupplyInternal &&
    BigNumber(totalSupplyExternal).lt(totalSupplyInternal)
  ) {
    warnings.push({
      type: "supply",
      severity: "high",
      diff: [totalSupplyInternal ?? "0", totalSupplyExternal ?? "0"],
    })
  }

  if (!storedToken) return warnings

  if (externalToken.symbol !== storedToken.symbol) {
    warnings.push({
      type: "symbol",
      severity: "medium",
      diff: [storedToken.symbol, externalToken.symbol],
    })
  }

  if (externalToken.name !== storedToken.name) {
    warnings.push({
      type: "name",
      severity: "medium",
      diff: [storedToken.name, externalToken.name],
    })
  }

  if (externalToken.decimals !== storedToken.decimals) {
    warnings.push({
      type: "decimals",
      severity: "medium",
      diff: [storedToken.decimals, externalToken.decimals],
    })
  }

  return warnings
}

export type ExternalAssetBadgeVariant = "warning" | "danger"

export const useExternalAssetsWhiteList = () => {
  const { isExternal, getAsset } = useAssets()
  const { isLoaded } = useRpcProvider()
  const assetRegistry = useExternalAssetRegistry()
  const { data: whitelist } = useExternalWhitelist()

  const getIsWhiteListed = useCallback(
    (assetId: string) => {
      const asset = assetId ? getAsset(assetId) : undefined

      if (isLoaded && asset && isExternal(asset)) {
        const externalAsset = asset.parachainId
          ? assetRegistry[+asset.parachainId]?.data?.get(asset.externalId ?? "")
          : null

        const isManuallyWhiteListed = !!whitelist?.includes(asset.id)
        const isWhiteListed =
          isManuallyWhiteListed ||
          asset?.isWhiteListed ||
          externalAsset?.isWhiteListed ||
          false

        const badge: ExternalAssetBadgeVariant = isWhiteListed
          ? "warning"
          : "danger"

        return {
          asset,
          isWhiteListed,
          badge,
        }
      }

      return {
        asset: null,
        isWhiteListed: false,
        badge: "" as ExternalAssetBadgeVariant,
      }
    },
    [getAsset, isLoaded, isExternal, assetRegistry, whitelist],
  )

  return {
    whitelist,
    getIsWhiteListed,
  }
}
