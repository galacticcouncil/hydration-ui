import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { u32 } from "@polkadot/types-codec"
import BigNumber from "bignumber.js"

type PoolValueProps = {
  omnipoolTotal: BigNumber
  stablepoolTotal: BigNumber
  className?: string
}

export const PoolValue = ({
  omnipoolTotal,
  stablepoolTotal,
  className,
}: PoolValueProps) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", justify: "end" }} className={className}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "column", gap: 10 }}>
          <Text fs={13} color="basic400">
            {t("liquidity.asset.details.total")}
          </Text>
          <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
            <Text lh={22} color="white" fs={18}>
              <DisplayValue value={omnipoolTotal} />
            </Text>
          </div>
        </div>
        <div sx={{ flex: "column", gap: 10, width: ["auto", 118] }}>
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Text fs={13} color="basic400">
              {t("liquidity.stablepool.asset.details.total")}
            </Text>
          </div>
          <DollarAssetValue
            value={stablepoolTotal}
            wrapper={(children) => (
              <Text fs={18} lh={22} color="white" tAlign={["right", "left"]}>
                {children}
              </Text>
            )}
          >
            <DisplayValue value={stablepoolTotal} />
          </DollarAssetValue>
        </div>
      </div>
    </div>
  )
}
