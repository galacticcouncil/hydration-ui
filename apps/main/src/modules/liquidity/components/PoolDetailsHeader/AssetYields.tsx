import { Chip, Flex } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { TooltipAPR } from "@/modules/liquidity/components/Farms/TooltipAPR"
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

  if (!isOmnipool) {
    if (Big(data.totalApr).eq(0)) return null

    return (
      <Chip variant="green" size="small">
        {t("percent.apr", {
          value: data.totalApr,
        })}
      </Chip>
    )
  }

  let apy = Big(0)
  let incentivesApr = Big(0)

  if (data.borrowApyData?.underlyingSupplyApy)
    apy = apy
      .plus(data.borrowApyData.underlyingSupplyApy)
      .plus(data.lpFeeOmnipool ?? 0)
      .plus(data.lpFeeStablepool ?? 0)

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
    const borderRadius = "xl"
    return (
      <Flex align="center" gap="xs">
        <Chip
          variant="green"
          size="small"
          sx={{
            borderRadius: "none",
            borderTopLeftRadius: borderRadius,
            borderBottomLeftRadius: borderRadius,
          }}
        >
          {t("percent.apr", {
            value: incentivesApr,
          })}
        </Chip>

        <Chip
          variant="green"
          size="small"
          sx={{
            borderRadius: "none",
            borderTopRightRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
          }}
        >
          <Flex align="center" gap="s">
            {t("percent.apy", {
              value: apy,
            })}

            <TooltipAPR
              borrowApyData={
                data.borrowApyData
                  ? { ...data.borrowApyData, incentives: [] }
                  : undefined
              }
              omnipoolFee={data.lpFeeOmnipool}
              stablepoolFee={data.lpFeeStablepool}
              farms={[]}
              iconColor={getToken("accents.success.emphasis")}
            />
          </Flex>
        </Chip>
      </Flex>
    )
  }

  return null
}
