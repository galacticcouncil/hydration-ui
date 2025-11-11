import { Chip, Flex } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import {
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"

export const AssetYields = ({
  data,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
}) => {
  const { t } = useTranslation("common")
  const isOmnipool = !isIsolatedPool(data)

  if (!isOmnipool)
    return (
      <Chip variant="green" size="small">
        {t("percent.apr", {
          value: data.totalApr,
        })}
      </Chip>
    )

  let apy = Big(0)
  let incentivesApr = Big(0)

  if (data.borrowApyData?.underlyingSupplyApy)
    apy = apy.plus(data.borrowApyData.underlyingSupplyApy)

  if (data.farms.length > 0) {
    incentivesApr = incentivesApr.plus(
      data.farms.reduce((acc, farm) => acc.plus(farm.apr), Big(0)),
    )
  }

  if (data.borrowApyData?.incentivesNetAPR)
    incentivesApr = incentivesApr.plus(data.borrowApyData.incentivesNetAPR)

  if (incentivesApr.gt(0) && !apy.gt(0)) {
    return (
      <Chip variant="green" size="small">
        {t("percent.apr", {
          value: incentivesApr,
        })}
      </Chip>
    )
  }

  if (apy.gt(0) && !incentivesApr.gt(0)) {
    return (
      <Chip variant="green" size="small">
        {t("percent.apy", {
          value: apy,
        })}
      </Chip>
    )
  }

  if (incentivesApr.gt(0) && apy.gt(0)) {
    const borderRadius = 32
    return (
      <Flex align="center" gap={1}>
        <Chip
          variant="green"
          size="small"
          sx={{ borderRadius: `${borderRadius}px 0 0 ${borderRadius}px` }}
        >
          {t("percent.apr", {
            value: incentivesApr,
          })}
        </Chip>

        <Chip
          variant="green"
          size="small"
          sx={{ borderRadius: `0 ${borderRadius}px ${borderRadius}px 0` }}
        >
          {t("percent.apy", {
            value: apy,
          })}
        </Chip>
      </Flex>
    )
  }

  return null
}
