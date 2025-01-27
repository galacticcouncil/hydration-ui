import * as React from "react"
import { createComponent } from "@lit-labs/react"
import {
  AssetId,
  AssetBadge,
  ChainLogo as ChainLogoUi,
  PlaceholderLogo,
} from "@galacticcouncil/ui"
import { assetPlaceholderCss, SATokenWrapper } from "./AssetIcon.styled"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useExternalAssetsWhiteList } from "api/external"
import { findNestedKey, HYDRADX_PARACHAIN_ID } from "@galacticcouncil/sdk"
import { ResponsiveValue } from "utils/responsive"
import { useAssets } from "providers/assets"
import { Icon } from "components/Icon/Icon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"

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

export const MultipleAssetLogo = ({
  iconId,
  size = 26,
}: {
  iconId: string | string[] | undefined
  size?: ResponsiveValue<number>
}) => {
  const { getAssetWithFallback } = useAssets()
  if (!iconId) return <Icon size={size} icon={<AssetLogo id={iconId} />} />
  const allIconIds = Array.isArray(iconId)
    ? iconId
        .map((id) => {
          const { iconId } = getAssetWithFallback(id)

          return iconId
        })
        .flat()
    : iconId
  return typeof allIconIds === "string" ? (
    <Icon size={size} icon={<AssetLogo id={allIconIds} />} />
  ) : (
    <MultipleIcons
      size={size}
      icons={allIconIds.map((id) => ({
        icon: <AssetLogo key={id} id={id} />,
      }))}
    />
  )
}

export const AssetLogo = ({ id }: { id?: string }) => {
  const { t } = useTranslation()
  const { getAsset, getErc20, isErc20 } = useAssets()

  const { getIsWhiteListed } = useExternalAssetsWhiteList()

  const asset = useMemo(() => {
    const assetDetails = id ? getErc20(id) || getAsset(id) : undefined
    const { badge } = getIsWhiteListed(assetDetails?.id ?? "")

    return {
      details: assetDetails,
      badgeVariant: badge,
    }
  }, [getAsset, getErc20, getIsWhiteListed, id])

  const { details, badgeVariant } = asset

  if (details) {
    const underlyingAssetId = isErc20(details)
      ? details.underlyingAssetId
      : undefined

    const ethereumNetworkEntry = findNestedKey(details.location, "ethereum")

    if (ethereumNetworkEntry) {
      const { ethereum } = ethereumNetworkEntry
      const ethereumChain = findNestedKey(ethereum, "chainId")
      const ethereumAsset = findNestedKey(details.location, "key")

      return (
        <UigcAssetId
          css={{ "& uigc-logo-chain": { display: "none" } }}
          ref={(el) => {
            el &&
              ethereumChain.chainId &&
              el.setAttribute("chainOrigin", ethereumChain.chainId)
            el && el.setAttribute("fit", "")
          }}
          ecosystem="ethereum"
          asset={ethereumAsset.key}
          chain={ethereumChain.chainId}
          chainOrigin={ethereumChain.chainId}
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

    const Wrapper = underlyingAssetId ? SATokenWrapper : React.Fragment

    return (
      <Wrapper>
        <UigcAssetId
          css={{ "& uigc-logo-chain": { display: "none" } }}
          ref={(el) => {
            el &&
              details.parachainId &&
              el.setAttribute("chainOrigin", details.parachainId)
            el && el.setAttribute("fit", "")
          }}
          ecosystem="polkadot"
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
      </Wrapper>
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
