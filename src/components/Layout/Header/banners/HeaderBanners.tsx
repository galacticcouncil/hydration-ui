import { WarningMessage } from "components/WarningMessage/WarningMessage"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { NewFarmsBanner } from "sections/pools/components/NewFarmsBanner"
import {
  LiquidityPositionsBanner,
  LiquidityPositionsBannerWrapper,
} from "./LiquidityPositionsBanner"
import { DOTLiquidityPositionsBannerWrapper } from "./DOTLiquidityPositionsBanner.utils"
import { DOTLiquidityPositionsBanner } from "./DOTLiquidityPositionsBanner"

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

      {warnings.warnings.invalidPositions.visible === undefined ? (
        <LiquidityPositionsBannerWrapper />
      ) : (
        <LiquidityPositionsBanner />
      )}

      {warnings.warnings.dotLiquidity.visible === undefined ? (
        <DOTLiquidityPositionsBannerWrapper />
      ) : (
        <DOTLiquidityPositionsBanner />
      )}

      {isLoaded && <NewFarmsBanner />}
    </>
  )
}
