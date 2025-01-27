import BigNumber from "bignumber.js"
import { useTranslation } from "react-i18next"
import { useEnteredDate } from "utils/block"
import {
  isXYKDeposit,
  TDepositData,
} from "sections/pools/farms/position/FarmingPosition.utils"
import { Summary } from "components/Summary/Summary"
import { useAssets } from "providers/assets"
import { usePoolData } from "sections/pools/pool/Pool"
import { useAccountClaimableFarmValues } from "api/farms"

type FarmDetailsModalValuesProps = {
  depositData: TDepositData
  enteredBlock: BigNumber
  yieldFarmId: string
}

export const FarmDetailsModalValues = ({
  depositData,
  enteredBlock,
  yieldFarmId,
}: FarmDetailsModalValuesProps) => {
  const { t } = useTranslation()
  const {
    pool: { meta, id },
  } = usePoolData()
  const { getAssetWithFallback, isShareToken } = useAssets()
  const { data: claimableValues } = useAccountClaimableFarmValues()

  const poolClaimableValues = claimableValues
    ?.get(isShareToken(meta) ? meta.poolAddress : id)
    ?.find((farm) => farm.yieldFarmId === yieldFarmId)

  const rewardCurrencyMeta = poolClaimableValues?.rewardCurrency
    ? getAssetWithFallback(poolClaimableValues.rewardCurrency)
    : undefined
  const entered = useEnteredDate(enteredBlock)

  return (
    <div sx={{ pt: 22 }}>
      <Summary
        rows={[
          {
            label: t("farms.modal.details.joinedOn.label"),
            content: t("farms.positions.labels.enterDate.value", {
              date: entered.data,
            }),
          },
          {
            label: t("farms.modal.details.value.label"),
            content: isXYKDeposit(depositData)
              ? [
                  t("value.tokenWithSymbol", {
                    value: depositData.assetA.amount,
                    symbol: depositData.assetA.symbol,
                  }),
                  t("value.tokenWithSymbol", {
                    value: depositData.assetA.amount,
                    symbol: depositData.assetA.symbol,
                  }),
                ].join(" | ")
              : t("value.tokenWithSymbol", {
                  value: depositData.totalValueShifted,
                  symbol: depositData.meta.symbol,
                }),
          },
          {
            label: t("farms.modal.details.mined.label"),
            content: t("farms.modal.details.mined.value", {
              value: poolClaimableValues?.value,
              symbol: rewardCurrencyMeta?.symbol,
            }),
          },
        ]}
      />
    </div>
  )
}
