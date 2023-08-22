import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Fragment } from "react"
import { SBadge } from "../StablePool.styled"
import { u32, u8 } from "@polkadot/types"
import BigNumber from "bignumber.js"

type PoolDetailsProps = {
  assets: {
    id: string
    symbol: string
    decimals: u8 | u32
  }[]
  tradeFee: BigNumber
  className?: string
}
export const PoolDetails = ({
  assets,
  tradeFee,
  className,
}: PoolDetailsProps) => {
  const { t } = useTranslation()

  const tradeFeeDisplay = tradeFee.toString()

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
                icon: getAssetLogo(asset.symbol),
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
            gap: 8,
            align: ["end", "start"],
            width: ["auto", 118],
          }}
        >
          <Text fs={13} color="basic400">
            {t("liquidity.asset.details.fee")}
          </Text>
          <Text lh={22} color="white" fs={18}>
            {t("value.percentage", { value: tradeFeeDisplay })}
          </Text>
        </div>
      </div>
      <Separator sx={{ mt: 44, mb: 34 }} color="white" opacity={0.06} />
    </div>
  )
}
