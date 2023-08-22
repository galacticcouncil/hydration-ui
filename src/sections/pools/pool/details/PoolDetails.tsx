import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useDisplayPrice } from "utils/displayAsset"

type PoolDetailsProps = {
  pool: OmnipoolPool
  className?: string
}

export const PoolDetails = ({ pool, className }: PoolDetailsProps) => {
  const { t } = useTranslation()
  const spotPrice = useDisplayPrice(pool.id)

  return (
    <div sx={{ flex: "column" }} className={className}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "column", gap: 10 }}>
          <Text fs={13} color="basic400">
            {t("liquidity.asset.title")}
          </Text>
          <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
            <Icon size={27} icon={<AssetLogo id={pool.id.toString()} />} />
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
          {spotPrice.isLoading ? (
            <Skeleton width={118} height={21} />
          ) : (
            <Text lh={22} color="white" fs={18}>
              <DisplayValue value={spotPrice.data?.spotPrice} type="token" />
            </Text>
          )}
        </div>
      </div>
      <Separator sx={{ mt: [18, 20] }} />
    </div>
  )
}
