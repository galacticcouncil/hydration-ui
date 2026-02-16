import { isStablepoolType, TAnyPool } from "sections/pools/PoolsPage.utils"
import { AvailableFarms } from "sections/pools/pool/availableFarms/AvailableFarms"
import { MoneyMarketIncentives } from "./MoneyMarketIncentives"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Separator } from "components/Separator/Separator"
import { PRIME_STABLESWAP_ASSET_ID } from "utils/constants"

export const AvailableIncentives = ({ pool }: { pool: TAnyPool }) => {
  const { t } = useTranslation()

  const isFarms = !!pool.allFarms.length
  const isMoneyMarketIncentives =
    isStablepoolType(pool) &&
    (!!pool.relatedAToken || pool.poolId === PRIME_STABLESWAP_ASSET_ID)

  if (!isFarms && !isMoneyMarketIncentives) return null

  return (
    <>
      <Separator
        color="white"
        opacity={0.06}
        sx={{ mx: "-30px", width: "calc(100% + 60px)" }}
      />
      <div sx={{ flex: "column", gap: 12 }}>
        <Text fs={16} font="GeistMono" tTransform="uppercase">
          {t("liquidity.pool.details.incentives.label")}
        </Text>
        {isMoneyMarketIncentives && <MoneyMarketIncentives pool={pool} />}
        {isFarms && <AvailableFarms farms={pool.allFarms} />}
      </div>
    </>
  )
}
