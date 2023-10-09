import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"

type PoolValueProps = {
  totalOmnipoolDisplay: BigNumber
  total: BigNumber
  className?: string
}

export const PoolValue = ({
  total,
  className,
  totalOmnipoolDisplay,
}: PoolValueProps) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", justify: "end" }} className={className}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "column", gap: 10, width: ["auto", 118] }}>
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Text fs={13} color="basic400">
              {t("liquidity.asset.details.total")}
            </Text>
          </div>
          <DollarAssetValue
            value={totalOmnipoolDisplay}
            wrapper={(children) => (
              <Text fs={18} lh={22} color="white" tAlign={["right", "left"]}>
                {children}
              </Text>
            )}
          >
            <DisplayValue value={totalOmnipoolDisplay} />
          </DollarAssetValue>
        </div>

        <div sx={{ flex: "column", gap: 10, width: ["auto", 118] }}>
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Text fs={13} color="basic400">
              {t("liquidity.stablepool.asset.details.total")}
            </Text>
          </div>
          <DollarAssetValue
            value={total}
            wrapper={(children) => (
              <Text fs={18} lh={22} color="white" tAlign={["right", "left"]}>
                {children}
              </Text>
            )}
          >
            <DisplayValue value={total} />
          </DollarAssetValue>
        </div>
      </div>
    </div>
  )
}
