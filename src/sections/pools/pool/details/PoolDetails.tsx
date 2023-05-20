import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { Icon } from "components/Icon/Icon"
import { useSpotPrice } from "api/spotPrice"
import { useApiIds } from "api/consts"
import Skeleton from "react-loading-skeleton"

type PoolDetailsProps = {
  pool: OmnipoolPool
  className?: string
}

export const PoolDetails = ({ pool, className }: PoolDetailsProps) => {
  const { t } = useTranslation()
  const apiIds = useApiIds()
  const spotPrice = useSpotPrice(pool.id, apiIds.data?.stableCoinId)

  return (
    <div sx={{ flex: "column" }} className={className}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "column", gap: 10 }}>
          <Text fs={13} color="basic400">
            {t("liquidity.asset.title")}
          </Text>
          <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
            <Icon size={27} icon={getAssetLogo(pool.symbol)} />
            <div sx={{ flex: "column", gap: 2 }}>
              <Text color="white" fs={16}>
                {pool.symbol}
              </Text>
              <Text color="whiteish500" fs={13}>
                {pool.name}
              </Text>
            </div>
          </div>
        </div>
        <div
          sx={{
            flex: "column",
            gap: 10,
            align: ["end", "start"],
            width: ["auto", 118],
          }}
        >
          <Text fs={13} color="basic400">
            {t("liquidity.asset.details.price")}
          </Text>
          {spotPrice.isLoading || apiIds.isLoading ? (
            <Skeleton width={118} height={21} />
          ) : (
            <Text>
              {t("value.token", {
                value: spotPrice.data?.spotPrice,
                numberSuffix: "$", //TODO: Add spotPrice token symbol when we supports it
              })}
            </Text>
          )}
        </div>
      </div>
      <Separator sx={{ mt: [18, 20] }} />
    </div>
  )
}
