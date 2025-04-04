import { FC } from "react"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { BoxSwitch, BoxSwitchOption } from "components/BoxSwitch/BoxSwitch"
import { Controller, useFormContext } from "react-hook-form"
import { Input } from "components/Input/Input"
import { RemoveDepositFormValues } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal.form"

type Props = {
  readonly balance: string
  readonly percentage: number
  readonly onPercentageChange: (percentage: number) => void
}

export const ShareTokenAmount: FC<Props> = ({
  balance,
  percentage,
  onPercentageChange,
}) => {
  const { t } = useTranslation()
  const { control, setValue } = useFormContext<RemoveDepositFormValues>()

  return (
    <div
      sx={{ flex: "column", gap: 6, py: 8, px: 10 }}
      css={{ background: "#00010766" }}
    >
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "center",
        }}
      >
        <Text fw={500} fs={12} lh="1" color="whiteish500">
          {t("wallet.strategy.remove.shareTokenAmount")}
        </Text>
        <div sx={{ flex: "row", align: "center", gap: 2 }}>
          <Text fw={500} fs={11} lh="1.4" css={{ color: "#FFFFFFB2" }}>
            {t("balance")}
          </Text>
          <Text fw={500} fs={11} lh="1.4" color="white">
            {t("value", { value: balance })}
          </Text>
        </div>
      </div>
      <div
        css={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          columnGap: 6,
        }}
      >
        <BoxSwitch
          options={options}
          selected={percentage}
          onSelect={(value) => {
            onPercentageChange(value)
            setValue("customPercentageInput", "")
          }}
        />
        <Controller
          control={control}
          name="customPercentageInput"
          render={({ field }) => (
            <Input
              value={field.value.toString()}
              onChange={(value) => {
                field.onChange(value)
                onPercentageChange(
                  Math.max(0, Math.min(100, Number(value) || 0)),
                )
              }}
              name="custom"
              label={t("custom")}
              placeholder={t("custom")}
              unit="%"
            />
          )}
        />
      </div>
    </div>
  )
}

const options: ReadonlyArray<BoxSwitchOption> = [
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "MAX", value: 100 },
]
