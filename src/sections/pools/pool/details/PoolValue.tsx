import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { TOmnipoolAsset } from "sections/pools/PoolsPage.utils"
import { BN_NAN } from "utils/constants"
import { SInfoIcon } from "sections/pools/pool/Pool.styled"

type PoolValueProps = { pool: TOmnipoolAsset; className?: string }

export const PoolValue = ({ pool, className }: PoolValueProps) => {
  const { t } = useTranslation()

  const { isStablepool } = pool

  return (
    <div sx={{ flex: "column", justify: "end" }} className={className}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "column", gap: 10 }}>
          <Text fs={13} color="basic400">
            {t("liquidity.asset.details.total")}
          </Text>
          <div sx={{ flex: "row", align: "center", gap: 8, mb: 8 }}>
            <Text lh={22} color="white" fs={18}>
              <DisplayValue value={pool.totalDisplay} />
            </Text>
          </div>
        </div>
        <div sx={{ flex: "column", gap: 10, width: ["auto", 118] }}>
          {isStablepool ? (
            <>
              <div sx={{ flex: "row", align: "center", gap: 6 }}>
                <Text fs={13} color="basic400">
                  {t("liquidity.stablepool.asset.details.total")}
                </Text>
              </div>
              <DollarAssetValue
                value={pool.stablepoolTotal.value}
                wrapper={(children) => (
                  <Text
                    fs={18}
                    lh={22}
                    color="white"
                    tAlign={["right", "left"]}
                  >
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={pool.stablepoolTotal.value} />
              </DollarAssetValue>
            </>
          ) : (
            <>
              <div sx={{ flex: "row", align: "center", gap: 6 }}>
                <Text fs={13} color="basic400">
                  {t("liquidity.asset.details.24hours")}
                </Text>
                <InfoTooltip
                  text={t("liquidity.asset.details.24hours.tooltip")}
                >
                  <SInfoIcon />
                </InfoTooltip>
              </div>

              <DollarAssetValue
                value={pool.volumeDisplay ?? BN_NAN}
                wrapper={(children) => (
                  <Text
                    fs={18}
                    lh={22}
                    color="white"
                    tAlign={["right", "left"]}
                  >
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={pool.volumeDisplay} />
              </DollarAssetValue>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
