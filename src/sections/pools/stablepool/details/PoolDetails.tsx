import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Fragment, useMemo } from "react"
import { SBadge } from "sections/pools/stablepool/StablePool.styled"
import { u32, u8 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { BN_100 } from "utils/constants"

type PoolDetailsProps = {
  assets: {
    id: string
    symbol: string
    decimals: u8 | u32
  }[]
  fee: BigNumber
  className?: string
}
export const PoolDetails = ({ assets, fee, className }: PoolDetailsProps) => {
  const { t } = useTranslation()
  const feeDisplay = useMemo(() => fee.times(BN_100).toString(), [fee])

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
            gap: 8,
            align: ["end", "start"],
            width: ["auto", 118],
          }}
        >
          <Text fs={13} color="basic400">
            {t("liquidity.asset.details.fee")}
          </Text>
          <Text lh={22} color="white" fs={18}>
            {t("value.percentage", { value: feeDisplay })}
          </Text>
        </div>
      </div>
      <Separator sx={{ mt: 44, mb: 34 }} color="white" opacity={0.06} />
    </div>
  )
}
