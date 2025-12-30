import { useAccountPositions } from "api/deposits"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useEffect } from "react"
import { DOT_ASSET_ID } from "utils/constants"

export const DOTLiquidityPositionsBannerWrapper = () => {
  const { setWarnings } = useWarningsStore()

  const { data: accountPositions, isSuccess } = useAccountPositions()
  const { omnipoolDeposits = [], liquidityPositions = [] } =
    accountPositions ?? {}

  const hasInvalidPositions =
    omnipoolDeposits.some(
      (position) => position.data.ammPoolId === DOT_ASSET_ID,
    ) ||
    liquidityPositions.some((position) => position.assetId === DOT_ASSET_ID)

  useEffect(() => {
    if (isSuccess) {
      if (hasInvalidPositions) {
        setWarnings("dotLiquidity", true)
      } else {
        setWarnings("dotLiquidity", false)
      }
    }
  }, [isSuccess, hasInvalidPositions, setWarnings])

  return null
}
