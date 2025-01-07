import { UnifiedAddressesBanner } from "components/Layout/Header/banners/UnifiedAddressesBanner"
import { useUnifiedAddressesBannerStore } from "components/Layout/Header/banners/UnifiedAddressesBanner.utils"
import { ExternalLink } from "components/Link/ExternalLink"
import { Text } from "components/Typography/Text/Text"
import { WarningMessage } from "components/WarningMessage/WarningMessage"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { NewFarmsBanner } from "sections/pools/components/NewFarmsBanner"
import { UNIFIED_ADDRESS_FORMAT_ENABLED } from "utils/constants"

export const HeaderBanners = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()
  const warnings = useWarningsStore()

  const { visible: unifiedAddrBannerVisible, hide: hideUnifiedAddrBanner } =
    useUnifiedAddressesBannerStore()

  return (
    <>
      {UNIFIED_ADDRESS_FORMAT_ENABLED && unifiedAddrBannerVisible && (
        <UnifiedAddressesBanner onAccept={hideUnifiedAddrBanner} />
      )}
      {warnings.warnings.hdxLiquidity.visible && (
        <WarningMessage
          text={t("warningMessage.hdxLiquidity.title")}
          type="hdxLiquidity"
        />
      )}

      {warnings.warnings.btcFarms.visible && (
        <WarningMessage
          text={t("warningMessage.btcFarms.title")}
          type="btcFarms"
        />
      )}

      {warnings.warnings.wbtcCollateral.visible && (
        <WarningMessage
          text={
            <div>
              <Text fs={[12, 14]} as="span">
                {t("warningMessage.wbtcCollateral.title")}
              </Text>{" "}
              <ExternalLink
                sx={{ fontSize: [12, 14] }}
                href="https://hydration.subsquare.io/referenda/1"
                target="blank"
              >
                {t("warningMessage.wbtcCollateral.link")}
              </ExternalLink>
            </div>
          }
          type="wbtcCollateral"
        />
      )}

      {isLoaded && <NewFarmsBanner />}
    </>
  )
}
