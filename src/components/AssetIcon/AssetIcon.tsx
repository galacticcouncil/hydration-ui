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
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { useExternalAssetsWhiteList } from "api/external"
import { HYDRADX_PARACHAIN_ID } from "@galacticcouncil/sdk"

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

export const AssetLogo = ({ id }: { id?: string }) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const { getIsWhiteListed } = useExternalAssetsWhiteList()

  const asset = useMemo(() => {
    const assetDetails = id ? assets.getAsset(id) : undefined
    const { badge } = getIsWhiteListed(assetDetails?.id ?? "")

    return {
      details: assetDetails,
      badgeVariant: badge,
    }
  }, [assets, getIsWhiteListed, id])

  const { details, badgeVariant } = asset

  if (details)
    return (
      <UigcAssetId
        css={{ "& uigc-logo-chain": { display: "none" } }}
        ref={(el) => {
          el &&
            details.parachainId &&
            el.setAttribute("chainOrigin", details.parachainId)
          el && el.setAttribute("fit", "")
        }}
        ecosystem={"polkadot"}
        asset={id}
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

  return (
    <UigcAssetPlaceholder
      css={assetPlaceholderCss}
      ref={(el) => el && el.setAttribute("fit", "")}
      slot="placeholder"
    />
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
