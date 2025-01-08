import { ExternalLink } from "components/Link/ExternalLink"
import { Text } from "components/Typography/Text/Text"
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
