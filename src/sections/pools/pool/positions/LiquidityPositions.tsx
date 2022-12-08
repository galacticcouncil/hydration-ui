import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as MinusIcon } from "assets/icons/MinusIcon.svg"
import { useTranslation } from "react-i18next"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import {
  SButton,
  SInnerContainer,
  SOuterContainer,
} from "./LiquidityPositions.styled"

type LiquidityPositionsProps = {
  pool: OmnipoolPool
}

export const LiquidityPositions = ({ pool }: LiquidityPositionsProps) => {
  const { t } = useTranslation()
  return (
    <SOuterContainer>
      <Text fs={[16, 16]} color="basic400" sx={{ mb: 20 }}>
        {t("pools.pool.nft.title")}
      </Text>
      <SInnerContainer>
        <div sx={{ flex: "column", gap: 24 }} css={{ flex: 1 }}>
          <div sx={{ flex: "row", gap: 7, align: "center", ml: "-25px" }}>
            <Icon
              icon={getAssetLogo(pool.symbol)}
              sx={{ width: 18, height: "fit-content" }}
            />
            <Text fs={[18, 18]}>
              {t("pools.pool.positions.position.title", { index: 1 })}
            </Text>
          </div>
          <div sx={{ flex: "row", justify: "space-between" }}>
            <div sx={{ flex: "column", gap: 6 }}>
              <Text fs={[14, 14]} color="whiteish500">
                {t("pools.pool.positions.position.amount")}
              </Text>
              <Text fs={[16, 16]}>
                {t("pools.pool.positions.position.shares", {
                  shares: 10000000000000,
                })}
              </Text>
            </div>
            <Separator orientation="vertical" />
            <div sx={{ flex: "column", gap: 6 }}>
              <Text fs={[16, 16]}>
                {t("pools.pool.positions.position.shares", {
                  shares: 10000000000000,
                })}
              </Text>
              <Text fs={[14, 14]} color="whiteish500">
                $2 000
              </Text>
            </div>
          </div>
        </div>
        <div sx={{ width: 220, flex: "row", align: "center" }}>
          <SButton
            variant="primary"
            fullWidth
            size="small"
            onClick={() => {
              console.log("Remove Liquidity")
            }}
          >
            <div sx={{ flex: "row", align: "center", justify: "center" }}>
              <Icon icon={<MinusIcon />} sx={{ mr: 8 }} />
              {t("pools.pool.actions.removeLiquidity")}
            </div>
          </SButton>
        </div>
      </SInnerContainer>
    </SOuterContainer>
  )
}
