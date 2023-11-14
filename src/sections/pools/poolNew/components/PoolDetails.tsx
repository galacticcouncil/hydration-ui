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

export const PoolDetails = ({ pool }: { pool: TOmnipoolAsset | TXYKPool }) => {
  const { t } = useTranslation()

  const isXYK = isXYKPool(pool)

  return (
    <div sx={{ flex: "column", gap: 20, p: 30 }}>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <GradientText gradient="pinkLightBlue" fs={19}>
          {pool.symbol} pool details
        </GradientText>
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
          <Text color="basic400">Total Value Locked</Text>
          <Text color="white">
            <DisplayValue value={pool.totalDisplay} />
          </Text>
        </div>

        <Separator orientation="vertical" color="white" opacity={0.06} />

        <div sx={{ flex: "column", gap: 6 }}>
          <Text color="basic400">24 volume</Text>
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
            <Text color="basic400">Price</Text>
            <Text color="white">
              <DisplayValue value={pool.spotPrice} type="token" />
            </Text>
          </div>
        )}

        <Separator orientation="vertical" color="white" opacity={0.06} />

        <div sx={{ flex: "column", gap: 6 }}>
          <Text color="basic400">Pool Fee</Text>
          <Text color="white">0.40%</Text>
        </div>
      </div>
    </div>
  )
}
