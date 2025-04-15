import { FC } from "react"
import { useTranslation } from "react-i18next"
import { TAsset } from "providers/assets"
import { UseHealthFactorChangeResult } from "api/borrow"
import { SummaryRow } from "components/Summary/SummaryRow"
import { HealthFactorChange } from "sections/lending/components/HealthFactorChange"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { IncentivesButton } from "sections/lending/components/incentives/IncentivesButton"
import BN from "bignumber.js"

type Props = {
  readonly asset: TAsset
  readonly minReceived: string
  readonly hfChange: UseHealthFactorChangeResult
  readonly reserve: ComputedReserveData
}

export const NewDepositSummary: FC<Props> = ({
  asset,
  minReceived,
  hfChange,
  reserve,
}) => {
  const { t } = useTranslation()

  return (
    <div>
      <SummaryRow
        label={t("wallet.strategy.deposit.minReceived")}
        content={t("value.tokenApproxWithSymbol", {
          value: minReceived,
          symbol: asset.symbol,
        })}
        withSeparator
      />
      <SummaryRow
        label={t("apy")}
        content={t("value.percentage", {
          value: BN(reserve.supplyAPY).times(100),
        })}
        withSeparator
      />
      <SummaryRow
        label={t("lending.rewardsAPR")}
        content={
          <IncentivesButton
            incentives={reserve.aIncentivesData}
            symbol={reserve.symbol}
          />
        }
        withSeparator
      />
      <SummaryRow
        label={t("healthFactor")}
        content={
          <HealthFactorChange
            healthFactor={hfChange?.currentHealthFactor ?? "-1"}
            futureHealthFactor={hfChange?.futureHealthFactor ?? "-1"}
          />
        }
      />
    </div>
  )
}
