import { AssetId, AssetBadge } from "@galacticcouncil/ui"
import { createComponent } from "@lit-labs/react"
import { useExternalTokensRugCheck } from "api/externalAssetRegistry"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import * as React from "react"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { SBadgeCointainer, SLogoContainer } from "./TokenInfo.styled"
import { useTranslation } from "react-i18next"
import SkullIcon from "assets/icons/SkullIcon.svg?react"

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

export type TokenHeaderProps = {
  asset: TExternalAsset
  internalId?: string
}

export const TokenInfoHeader: React.FC<TokenHeaderProps> = ({
  asset,
  internalId,
}) => {
  const { t } = useTranslation()
  const rugCheck = useExternalTokensRugCheck()
  const rugCheckData = rugCheck.tokensMap.get(internalId ?? "")

  const isHighSeverity = rugCheckData?.severity === "high"
  const badgeVariant = rugCheckData
    ? rugCheckData?.isWhitelisted
      ? "warning"
      : "danger"
    : ""

  console.log({ badgeVariant, isHighSeverity, rugCheckData, rugCheck })

  return (
    <div sx={{ flex: "row", gap: 10 }}>
      <SLogoContainer>
        <Icon
          sx={{ flexShrink: 0 }}
          size={46}
          icon={
            <UigcAssetId
              symbol={internalId ? asset.symbol : ""}
              ref={(e) =>
                e?.shadowRoot
                  ?.querySelector("uigc-logo-asset")
                  ?.setAttribute("style", "width:100%;height:100%;")
              }
            >
              {isHighSeverity ? (
                <SBadgeCointainer slot="badge">
                  <SkullIcon sx={{ color: "alarmRed400" }} />
                </SBadgeCointainer>
              ) : badgeVariant ? (
                <UigcAssetBadge
                  slot="badge"
                  variant={badgeVariant}
                  text={t(`wallet.addToken.tooltip.${badgeVariant}`)}
                />
              ) : null}
            </UigcAssetId>
          }
        />
      </SLogoContainer>
      <div>
        <Text fs={22} lh={28} font="GeistMono">
          {asset.symbol}
        </Text>
        <Text fs={13} color="darkBlue200">
          {asset.name}
        </Text>
      </div>
    </div>
  )
}
