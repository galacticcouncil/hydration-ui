import { UseHealthFactorChangeResult } from "api/borrow"
import { Separator } from "components/Separator/Separator"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { TAsset } from "providers/assets"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { HealthFactorChange } from "sections/lending/components/HealthFactorChange"

type Props = {
  readonly hfChange: UseHealthFactorChangeResult
  readonly minReceived: string
  readonly assetReceived: TAsset | null
}

export const RemoveDepositSummary: FC<Props> = ({
  hfChange,
  minReceived,
  assetReceived,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <SummaryRow
        label={t("wallet.strategy.deposit.minReceived")}
        content={
          <Text fw={500} fs={14} lh="1" color="white">
            ≈ {minReceived} {assetReceived?.symbol}
          </Text>
        }
      />
      {hfChange && (
        <>
          <Separator color="darkBlue401" />
          <SummaryRow
            label={t("healthFactor")}
            content={
              <HealthFactorChange
                healthFactor={hfChange.currentHealthFactor}
                futureHealthFactor={hfChange.futureHealthFactor}
              />
            }
          />
        </>
      )}
    </>
  )
}
