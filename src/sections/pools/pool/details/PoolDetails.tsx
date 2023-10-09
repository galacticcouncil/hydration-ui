import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useDisplayPrice } from "utils/displayAsset"
import { useRpcProvider } from "providers/rpcProvider"
import { u32 } from "@polkadot/types-codec"
import { SBadge } from "./PoolDetails.styled"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Fragment } from "react"

type PoolDetailsProps = {
  id: u32
  className?: string
}

export const PoolDetails = ({ id, className }: PoolDetailsProps) => {
  const { t } = useTranslation()

  const rpc = useRpcProvider()
  const meta = rpc.assets.getAsset(id.toString())
  const spotPrice = useDisplayPrice(id)

  return (
    <div sx={{ flex: "column" }} className={className}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "column", gap: 10 }}>
          <div sx={{ flex: "row", gap: 8, align: "center" }}>
            {rpc.assets.isStableSwap(meta) && (
              <SBadge>
                <Text fs={11} fw={700} color="basic900">
                  {t("liquidity.stablepool")}
                </Text>
              </SBadge>
            )}
            <Text fs={13} color="basic400">
              {rpc.assets.isStableSwap(meta)
                ? t("liquidity.assets.title")
                : t("liquidity.asset.title")}
            </Text>
          </div>

          {rpc.assets.isStableSwap(meta) ? (
            <div sx={{ flex: "column", gap: 5 }}>
              <MultipleIcons
                icons={meta.assets.map((asset: string) => ({
                  icon: <AssetLogo id={asset} />,
                }))}
              />
              <div sx={{ flex: "row" }}>
                {meta.name.split("/").map((asset, index) => (
                  <Fragment key={asset}>
                    {index ? <Text color="whiteish500">/</Text> : null}
                    <Text color="white">{asset}</Text>
                  </Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
              <Icon size={27} icon={<AssetLogo id={id.toString()} />} />
              <div sx={{ flex: "column", gap: 2 }}>
                <Text color="white" fs={16}>
                  {meta.symbol}
                </Text>
                <Text color="whiteish500" fs={13}>
                  {meta.name}
                </Text>
              </div>
            </div>
          )}
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
