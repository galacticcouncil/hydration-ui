import * as React from "react"
import { createComponent } from "@lit-labs/react"
import {
  AssetId,
  AssetBadge,
  ChainLogo as ChainLogoUi,
  PlaceholderLogo,
} from "@galacticcouncil/ui"
import { assetPlaceholderCss } from "./AssetIcon.styled"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ExternalAssetBadgeVariant, useExternalWhitelist } from "api/external"
import { findNestedKey, HYDRADX_PARACHAIN_ID } from "@galacticcouncil/sdk"
import { ResponsiveValue } from "utils/responsive"
import { TAsset, useAssets } from "providers/assets"
import { Icon } from "components/Icon/Icon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { useExternalAssetsMetadata } from "state/store"
import { useShallow } from "hooks/useShallow"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { pick } from "utils/rx"
import { GDOT_ERC20_ASSET_ID, GETH_ERC20_ASSET_ID } from "utils/constants"
import { useATokens } from "api/borrow"

export const UigcAssetPlaceholder = createComponent({
  tagName: "uigc-logo-placeholder",
  elementClass: PlaceholderLogo,
  react: React,
})

export const UigcAssetId = createComponent({
  tagName: "uigc-asset-id",
  elementClass: AssetId,
  react: React,
})

export const UigcAssetBadge = createComponent({
  tagName: "uigc-asset-badge",
  elementClass: AssetBadge,
  react: React,
})

export const UigcChainLogo = createComponent({
  tagName: "uigc-logo-chain",
  elementClass: ChainLogoUi,
  react: React,
})

const A_TOKEN_HIGHLIGHT_RING_BLACKLIST = [
  GDOT_ERC20_ASSET_ID,
  GETH_ERC20_ASSET_ID,
]

export const MultipleAssetLogo = ({
  iconId,
  size = 26,
}: {
  iconId: string | string[] | undefined
  size?: ResponsiveValue<number>
}) => {
  const { aTokenMap } = useATokens()
  const { getAssetWithFallback } = useAssets()
  if (!iconId) return <Icon size={size} icon={<AssetLogo id={iconId} />} />

  const underlyingATokenId =
    typeof iconId === "string" &&
    !A_TOKEN_HIGHLIGHT_RING_BLACKLIST.includes(iconId)
      ? aTokenMap.get(iconId)
      : undefined

  const underlyingAToken = underlyingATokenId
    ? getAssetWithFallback(underlyingATokenId)
    : undefined

  const isATokenPool = !!underlyingAToken && underlyingAToken?.isStableSwap
  const icons = isATokenPool ? underlyingAToken?.iconId : iconId

  const allIconIds = Array.isArray(icons)
    ? icons
        .map((id) => {
          const { iconId } = getAssetWithFallback(id)

          return iconId
        })
        .flat()
    : icons

  return typeof allIconIds === "string" ? (
    <Icon size={size} icon={<AssetLogo id={allIconIds} />} />
  ) : (
    <MultipleIcons
      isATokenPool={isATokenPool}
      size={size}
      icons={allIconIds.map((id) => ({
        icon: <AssetLogo key={id} id={id} isATokenPool={isATokenPool} />,
      }))}
    />
  )
}

export const AssetLogo = ({
  id,
  isATokenPool,
}: {
  id?: string
  isATokenPool?: boolean
}) => {
  const { t } = useTranslation()
  const { getAsset, getErc20, isErc20 } = useAssets()
  const { getExternalAssetMetadata, isInitialized } = useExternalAssetsMetadata(
    useShallow((state) =>
      pick(state, ["getExternalAssetMetadata", "isInitialized"]),
    ),
  )
  const { data: whitelist } = useExternalWhitelist()

  const asset = useMemo(() => {
    const assetDetails = id ? getErc20(id) || getAsset(id) : undefined

    let isWhitelisted: boolean | undefined
    let badge: ExternalAssetBadgeVariant | undefined

    if (assetDetails?.isExternal) {
      if (assetDetails.parachainId && assetDetails.externalId) {
        let meta: TExternalAsset | TAsset | undefined

        if (!assetDetails.symbol) {
          if (!isInitialized) {
            return {
              details: assetDetails,
              badgeVariant: badge,
            }
          }

          meta = getExternalAssetMetadata(
            assetDetails.parachainId,
            assetDetails.externalId,
          )
        } else {
          meta = assetDetails
        }

        if (meta) {
          const { isWhiteListed } = meta
          isWhitelisted = isWhiteListed
        }
      } else {
        isWhitelisted = false
      }

      if (!isWhitelisted) isWhitelisted = !!whitelist?.includes(assetDetails.id)

      badge = isWhitelisted ? "warning" : "danger"
    }

    return {
      details: assetDetails,
      badgeVariant: badge,
    }
  }, [
    getAsset,
    getErc20,
    getExternalAssetMetadata,
    id,
    whitelist,
    isInitialized,
  ])

  const { details, badgeVariant } = asset

  if (details) {
    const underlyingAssetId = isErc20(details)
      ? details.underlyingAssetId
      : undefined

    const isAToken =
      !!underlyingAssetId &&
      !A_TOKEN_HIGHLIGHT_RING_BLACKLIST.includes(details.id)

    const decoration = (() => {
      if (isATokenPool) return "atoken-pool"
      if (isAToken) return "atoken"
    })()

    const ethereumNetworkEntry = findNestedKey(details.location, "ethereum")

    if (ethereumNetworkEntry) {
      const { ethereum } = ethereumNetworkEntry
      const ethereumChain = findNestedKey(ethereum, "chainId")
      const ethereumAsset = findNestedKey(details.location, "key")

      const ethereumAssetId = ethereumAsset
        ? ethereumAsset.key
        : "0x0000000000000000000000000000000000000000"

      return (
        <UigcAssetId
          css={{ "& uigc-logo-chain": { display: "none" } }}
          ref={(el) => {
            el &&
              ethereumChain?.chainId &&
              el.setAttribute("chainOrigin", ethereumChain.chainId)
            el && el.setAttribute("fit", "")
          }}
          ecosystem="ethereum"
          asset={ethereumAssetId}
          chain={ethereumChain?.chainId}
          chainOrigin={ethereumChain?.chainId}
          decoration={decoration}
        >
          {badgeVariant && (
            <UigcAssetBadge
              slot="badge"
              variant={badgeVariant}
              text={t(`wallet.addToken.tooltip.${badgeVariant}`)}
            />
          )}
        </UigcAssetId>
      )
    }

    return (
      <UigcAssetId
        css={{ "& uigc-logo-chain": { display: "none" } }}
        ref={(el) => {
          el &&
            details.parachainId &&
            el.setAttribute("chainOrigin", details.parachainId)
          el && el.setAttribute("fit", "")
        }}
        ecosystem="polkadot"
        decoration={decoration}
        asset={underlyingAssetId ?? details.id}
        chain={HYDRADX_PARACHAIN_ID.toString()}
        chainOrigin={details.parachainId}
      >
        {badgeVariant && (
          <UigcAssetBadge
            slot="badge"
            variant={badgeVariant}
            text={t(`wallet.addToken.tooltip.${badgeVariant}`)}
          />
        )}
      </UigcAssetId>
    )
  }

  return (
    <UigcAssetPlaceholder
      css={assetPlaceholderCss}
      ref={(el) => el && el.setAttribute("fit", "")}
      slot="placeholder"
    />
  )
}

export const ExternalAssetLogo = ({
  id,
  parachainId,
  originHidden,
  children,
}: {
  id: string
  parachainId: number
  originHidden?: boolean
  children?: React.ReactNode
}) => {
  return (
    <UigcAssetId
      css={{ "& uigc-logo-chain": { display: "none" } }}
      ref={(el) => {
        if (el) {
          el.setAttribute("fit", "")
          if (parachainId && !originHidden)
            el.setAttribute("chainOrigin", parachainId.toString())
          el.shadowRoot
            ?.querySelector("uigc-logo-asset")
            ?.setAttribute("style", "width:100%;height:100%;")
        }
      }}
      ecosystem="polkadot"
      asset={id}
      chain={parachainId.toString()}
      chainOrigin={!originHidden ? parachainId.toString() : undefined}
    >
      {children}
    </UigcAssetId>
  )
}

export const ChainLogo = ({ id }: { id?: number }) => {
  return (
    <UigcChainLogo
      ecosystem={"polkadot"}
      chain={id?.toString()}
      ref={(el) => el && el.setAttribute("fit", "")}
    >
      <UigcAssetPlaceholder
        css={assetPlaceholderCss}
        ref={(el) => el && el.setAttribute("fit", "")}
        slot="placeholder"
      />
    </UigcChainLogo>
  )
}
