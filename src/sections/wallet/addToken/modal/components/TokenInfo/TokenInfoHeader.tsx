import { AssetId } from "@galacticcouncil/ui"
import { createComponent } from "@lit-labs/react"
import {
  ASSET_HUB_ID,
  getIconByRugSeverity,
  useExternalTokensRugCheck,
} from "api/externalAssetRegistry"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import * as React from "react"
import { useTranslation } from "react-i18next"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { SLogoContainer } from "./TokenInfo.styled"
import { theme } from "theme"

export const UigcAssetId = createComponent({
  tagName: "uigc-asset-id",
  elementClass: AssetId,
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

  const SeverityIcon = rugCheckData?.severity
    ? getIconByRugSeverity(rugCheckData?.severity)
    : null

  return (
    <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
      <div sx={{ flex: "row", gap: 10 }}>
        <SLogoContainer>
          <Icon
            sx={{ flexShrink: 0 }}
            size={46}
            icon={
              <UigcAssetId
                symbol={asset.symbol}
                ref={(e) =>
                  e?.shadowRoot
                    ?.querySelector("uigc-logo-asset")
                    ?.setAttribute("style", "width:100%;height:100%;")
                }
              />
            }
          />
          {SeverityIcon && <SeverityIcon sx={{ color: "alarmRed400" }} />}
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
      {asset.origin === ASSET_HUB_ID && (
        <Text
          color="brightBlue300"
          fs={12}
          css={{
            borderBottom: `1px solid ${theme.colors.brightBlue300}`,
            display: "inline-block",
            "&:hover": {
              color: theme.colors.brightBlue300,
            },
          }}
        >
          <a href="/">
            {t("wallet.addToken.link.assetHubCheck")} <LinkIcon height={10} />
          </a>
        </Text>
      )}
    </div>
  )
}
