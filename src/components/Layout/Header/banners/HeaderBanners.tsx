import { ExternalLink } from "components/Link/ExternalLink"
import { WarningMessage } from "components/WarningMessage/WarningMessage"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { NewFarmsBanner } from "sections/pools/components/NewFarmsBanner"

export const HeaderBanners = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()
  const warnings = useWarningsStore()

  return (
    <>
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
              <span>{t("warningMessage.wbtcCollateral.title")}</span>{" "}
              <ExternalLink
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
