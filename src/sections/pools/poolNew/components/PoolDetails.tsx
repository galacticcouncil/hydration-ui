import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { useTranslation } from "react-i18next"
import {
  TOmnipoolAsset,
  TXYKPool,
  isXYKPool,
} from "sections/pools/PoolsPage.utils"

import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { AssetLogo } from "components/AssetIcon/AssetIcon"

export const PoolDetails = ({ pool }: { pool: TOmnipoolAsset | TXYKPool }) => {
  const { t } = useTranslation()

  const isXYK = isXYKPool(pool)

  return (
    <div sx={{ flex: "column", gap: 20, p: 30 }}>
      <GradientText
        gradient="pinkLightBlue"
        fs={19}
        sx={{ width: "fit-content" }}
      >
        {t("liquidity.pool.details.title")}
      </GradientText>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div>
          {typeof pool.iconIds === "string" ? (
            <Icon
              size={26}
              icon={<AssetLogo id={pool.iconIds} />}
              css={{ flex: "1 0 auto" }}
            />
          ) : (
            <MultipleIcons
              size={26}
              icons={pool.iconIds.map((asset) => ({
                icon: <AssetLogo id={asset} />,
              }))}
            />
          )}
        </div>
        <Button size="small">
          <div
            sx={{
              flex: "row",
              align: "center",
              justify: "center",
              width: 312,
            }}
          >
            <Icon icon={<PlusIcon />} sx={{ mr: 8, height: 16 }} />
            {t("liquidity.asset.actions.addLiquidity")}
          </div>
        </Button>
      </div>
      <Separator
        color="white"
        opacity={0.06}
        sx={{ mx: "-30px", width: "calc(100% + 60px)" }}
      />
      <div
        sx={{
          flex: "row",
          justify: "space-between",
        }}
      >
        <div sx={{ flex: "column", gap: 6 }}>
          <Text color="basic400">{t("tvl")}</Text>
          <Text color="white">
            <DisplayValue value={pool.totalDisplay} />
          </Text>
        </div>

        <Separator orientation="vertical" color="white" opacity={0.06} />

        <div sx={{ flex: "column", gap: 6 }}>
          <Text color="basic400">{t("24Volume")}</Text>
          <Text color="white">
            {t("value.usd", { amount: pool.volumeDisplay })}
          </Text>
        </div>

        <Separator orientation="vertical" color="white" opacity={0.06} />

        {isXYK ? (
          <div sx={{ flex: "column", gap: 6 }}>
            <Text color="basic400">Fee</Text>
            <Text color="white">
              {t("value.percentage", { value: pool.fee })}
            </Text>
          </div>
        ) : (
          <div sx={{ flex: "column", gap: 6 }}>
            <Text color="basic400">{t("price")}</Text>
            <Text color="white">
              <DisplayValue value={pool.spotPrice} type="token" />
            </Text>
          </div>
        )}

        <Separator orientation="vertical" color="white" opacity={0.06} />

        <div sx={{ flex: "column", gap: 6 }}>
          <Text color="basic400">{t("liquidity.pool.details.fee")}</Text>
          <Text color="white">0.40%</Text>
        </div>
      </div>
    </div>
  )
}
