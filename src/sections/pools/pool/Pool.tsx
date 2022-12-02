import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { SContainer } from "./Pool.styled"
import { Text } from "components/Typography/Text/Text"
import { getAssetLogo, getAssetName } from "components/AssetIcon/AssetIcon"
import { useTranslation } from "react-i18next"
import { css } from "@emotion/react"

type Props = { pool: OmnipoolPool }

export const Pool = ({ pool }: Props) => {
  const { t } = useTranslation()

  return (
    <SContainer id={pool.id.toString()}>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
        <div>{getAssetLogo(pool.symbol)}</div>
        <div sx={{ flex: "column", gap: 2 }}>
          <Text color="white" fs={16}>
            {pool.symbol}
          </Text>
          <Text color="whiteish500" fs={13}>
            {getAssetName(pool.symbol)}
          </Text>
        </div>
      </div>
      <div
        css={css`
          display: flex;
          justify-content: space-between;

          > div {
            display: grid;
            grid-template-columns: auto 1fr;
            grid-column-gap: 16px;
            grid-row-gap: 8px;
            height: min-content;
            color: white;
          }
        `}
      >
        <div>
          <span>Trade Fee</span>
          <b>{t("value.percentage", { value: pool.tradeFee.times(100) })}</b>

          <span>Total Value Locked</span>
          <b>
            {t("value", {
              value: pool.total,
              numberSuffix: ` ${pool.symbol}`,
              decimalPlaces: 4,
            })}
          </b>

          <span>Total Value Locked</span>
          <b>
            {t("value", {
              value: pool.totalUSD,
              numberPrefix: `$`,
              decimalPlaces: 4,
            })}
          </b>

          <span>24h Volume</span>
          <b>
            {t("value", {
              value: pool.volume24h,
              numberPrefix: `$`,
              decimalPlaces: 4,
            })}
          </b>
        </div>

        <div>
          <span>Can Buy</span>
          <b>{pool.canBuy.toString()}</b>

          <span>Can Sell</span>
          <b>{pool.canSell.toString()}</b>

          <span>Can Add Liquidity</span>
          <b>{pool.canAddLiquidity.toString()}</b>

          <span>Can Remove Liquidity</span>
          <b>{pool.canRemoveLiquidity.toString()}</b>
        </div>
      </div>
    </SContainer>
  )
}
