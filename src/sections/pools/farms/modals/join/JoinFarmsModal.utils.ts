import { z } from "zod"
import { maxBalance, required } from "utils/validators"
import { BN_0 } from "utils/constants"
import { TFarmAprData, useOraclePrice } from "api/farms"
import { useMemo } from "react"
import { scaleHuman } from "utils/balance"
import { useTranslation } from "react-i18next"
import BN from "bignumber.js"
import { TLPData } from "utils/omnipool"
import { useAssets } from "providers/assets"
import { useAccountAssets } from "api/deposits"

export const useZodSchema = ({
  id,
  farms,
  position,
  enabled,
}: {
  id: string
  farms: TFarmAprData[]
  position?: TLPData
  enabled: boolean
}) => {
  const assetId = enabled ? id : undefined
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const { data: accountAssets } = useAccountAssets()

  const meta = getAssetWithFallback(id)
  const balance = assetId
    ? accountAssets?.accountAssetsMap.get(assetId)?.balance
    : undefined

  const minDeposit = useMemo(() => {
    return farms.reduce<{ value: BN; assetId?: string }>(
      (acc, farm) => {
        const minDeposit = BN(farm.minDeposit)

        return minDeposit.gt(acc.value)
          ? {
              value: minDeposit,
              assetId: farm.incentivizedAsset.toString(),
            }
          : acc
      },
      { value: BN_0, assetId: undefined },
    )
  }, [farms])

  const oraclePrice = useOraclePrice(minDeposit.assetId, assetId)

  if (!oraclePrice.data || assetId === undefined) return undefined

  const rule = required.refine(
    () => {
      if (position?.amount) {
        const valueInIncentivizedAsset = BN(position.amount)
          .times(oraclePrice.data?.price?.n ?? 1)
          .div(oraclePrice.data?.price?.d ?? 1)

        return valueInIncentivizedAsset.gte(minDeposit.value)
      }

      return true
    },
    () => {
      const maxValue = minDeposit.value
        .times(oraclePrice.data?.price?.d ?? 1)
        .div(oraclePrice.data?.price?.n ?? 1)

      return {
        message: t("farms.modal.join.minDeposit", {
          value: scaleHuman(maxValue, meta.decimals).times(1.02),
          symbol: meta.symbol,
        }),
      }
    },
  )

  return z.object({
    amount: position
      ? rule
      : rule.pipe(maxBalance(balance?.balance ?? "0", meta.decimals)),
  })
}
