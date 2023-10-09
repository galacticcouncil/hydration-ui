import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Fragment } from "react"
import { SBadge } from "sections/pools/stablepool/StablePool.styled"
import { TAsset } from "api/assetDetails"
import { useDisplayPrice } from "utils/displayAsset"
import Skeleton from "react-loading-skeleton"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { u32 } from "@polkadot/types-codec"

type PoolDetailsProps = {
  id: u32
  assets: TAsset[]
  className?: string
}
export const PoolDetails = ({ id, assets, className }: PoolDetailsProps) => {
  const { t } = useTranslation()
  const spotPrice = useDisplayPrice(id)

  return (
    <div sx={{ flex: "column" }} className={className}>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div sx={{ flex: "column", gap: 26 }}>
          <div sx={{ flex: "row", gap: 8, align: "center" }}>
            <SBadge>
              <Text fs={11} fw={700} color="basic900">
                {t("liquidity.stablepool")}
              </Text>
            </SBadge>
            <Text fs={13} color="basic400">
              {t("liquidity.assets.title")}
            </Text>
          </div>
          <div sx={{ flex: "column", gap: 5 }}>
            <MultipleIcons
              icons={assets.map((asset) => ({
                icon: <AssetLogo id={asset.id} />,
              }))}
            />
            <div sx={{ flex: "row" }}>
              {assets.map((asset, index) => (
                <Fragment key={asset.symbol}>
                  {index ? <Text color="whiteish500">/</Text> : null}
                  <Text color="white">{asset.symbol}</Text>
                </Fragment>
              ))}
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
