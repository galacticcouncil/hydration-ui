import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useRpcProvider } from "providers/rpcProvider"
import { SBadge } from "./PoolDetails.styled"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Fragment } from "react"
import {
  TOmnipoolAsset,
  TXYKPool,
  isXYKPool,
} from "sections/pools/PoolsPage.utils"

type PoolDetailsProps = {
  pool: TOmnipoolAsset | TXYKPool
  className?: string
}

export const PoolDetails = ({ pool, className }: PoolDetailsProps) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const isXyk = isXYKPool(pool)

  const meta = isXyk
    ? assets.getAsset(pool.shareTokenMeta.id)
    : assets.getAsset(pool.id)

  return (
    <div sx={{ flex: "column" }} className={className}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "column", gap: 10 }}>
          <div sx={{ flex: "row", gap: 8, align: "center" }}>
            {assets.isStableSwap(meta) && (
              <SBadge>
                <Text fs={11} fw={700} color="basic900">
                  {t("liquidity.stablepool")}
                </Text>
              </SBadge>
            )}
            <Text fs={13} color="basic400">
              {assets.isStableSwap(meta)
                ? t("liquidity.assets.title")
                : t("liquidity.asset.title")}
            </Text>
          </div>

          {assets.isStableSwap(meta) || assets.isShareToken(meta) ? (
            <div sx={{ flex: "column", gap: 5 }}>
              <MultipleIcons
                icons={meta.assets.map((asset: string) => ({
                  icon: <AssetLogo id={asset} />,
                }))}
              />
              <div sx={{ flex: "row" }}>
                {(assets.isShareToken(meta) ? meta.symbol : meta.name)
                  .split("/")
                  .map((asset, index) => (
                    <Fragment key={`${asset}-${index}`}>
                      {index ? <Text color="whiteish500">/</Text> : null}
                      <Text color="white">{asset}</Text>
                    </Fragment>
                  ))}
              </div>
            </div>
          ) : (
            <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
              <Icon size={27} icon={<AssetLogo id={pool.id} />} />
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
        <Separator
          sx={{ height: 40 }}
          css={{ alignSelf: "center" }}
          orientation="vertical"
          color="white"
          opacity={0.06}
        />
        <div
          sx={{
            flex: "column",
            gap: 10,
            align: isXyk ? ["center"] : ["end", "start"],
            width: ["auto", 118],
          }}
        >
          {isXYKPool(pool) ? (
            <>
              <Text fs={13} color="basic400">
                {t("liquidity.asset.details.fee")}
              </Text>
              <Text lh={22} color="white" fs={18}>
                {t("value.percentage", { value: pool.fee })}
              </Text>
            </>
          ) : (
            <>
              <Text fs={13} color="basic400">
                {t("liquidity.asset.details.price")}
              </Text>
              <Text lh={22} color="white" fs={18}>
                <DisplayValue value={pool.spotPrice} type="token" />
              </Text>
            </>
          )}
        </div>
        {isXyk && (
          <>
            <Separator
              sx={{ height: 40 }}
              css={{ alignSelf: "center" }}
              orientation="vertical"
              color="white"
              opacity={0.06}
            />
            <div
              sx={{
                flex: "column",
                gap: 10,
                align: ["end", "start"],
                width: ["auto", 118],
              }}
            >
              <Text fs={13} color="basic400">
                {t("liquidity.asset.details.poolShare")}
              </Text>
              <Text lh={22} color="white" fs={18}>
                {t("value.percentage", {
                  value: pool.shareTokenIssuance?.myPoolShare,
                  type: "token",
                })}
              </Text>
            </div>
          </>
        )}
      </div>
      <Separator sx={{ mt: [18, 20] }} color="white" opacity={0.06} />
    </div>
  )
}
