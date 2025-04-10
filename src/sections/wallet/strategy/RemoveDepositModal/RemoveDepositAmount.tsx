import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { FC, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { RemoveDepositFormValues } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal.form"
import { Slider } from "components/Slider/Slider"
import { ShareTokenAmount } from "sections/wallet/strategy/RemoveDepositModal/ShareTokenAmount"
import { BigNumber } from "bignumber.js"
import { RemoveDepositCustomInput } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositCustomInput"

type Props = {
  readonly assetId: string
  readonly balance: string
}

export const RemoveDepositAmount: FC<Props> = ({ assetId, balance }) => {
  const { control, setValue, watch } = useFormContext<RemoveDepositFormValues>()
  const [isFocusingCustomInput, setIsFocusingCustomInput] = useState(false)

  const customValue = watch("customValueInput")

  return (
    <Controller
      control={control}
      name="percentage"
      render={({ field }) => {
        const balanceToSell = new BigNumber(balance)
          .times(field.value)
          .div(100)
          .toString()

        return (
          <div sx={{ flex: "column", gap: 4 }}>
            <div sx={{ flex: "column", gap: 12, pb: 16 }}>
              <div
                sx={{
                  flex: "row",
                  justify: "space-between",
                  align: "center",
                  pt: 8,
                  pb: 16,
                }}
              >
                <AssetTableName id={assetId} />
                <RemoveDepositCustomInput
                  percentage={field.value}
                  value={customValue > 0 ? customValue : balanceToSell}
                  onFocus={(e: React.FocusEvent<HTMLInputElement, Element>) => {
                    e.target.select()
                    setIsFocusingCustomInput(true)
                  }}
                  onBlur={() => setIsFocusingCustomInput(false)}
                  onValueChange={({ floatValue }) => {
                    if (!isFocusingCustomInput || floatValue === undefined) {
                      return
                    }

                    setValue(
                      "customValueInput",
                      Math.min(floatValue, Number(balance)),
                    )

                    const newPercentage = new BigNumber(floatValue)
                      .div(balance)
                      .times(100)
                      .toString()

                    field.onChange(newPercentage)
                    setValue("customPercentageInput", "")
                  }}
                />
              </div>
              <Slider
                value={[field.value]}
                min={0}
                max={100}
                step={1}
                onChange={(value) => {
                  field.onChange(value[0])
                  setValue("customPercentageInput", "")
                  setValue("customValueInput", 0)
                }}
              />
            </div>
            <ShareTokenAmount
              balance={balance}
              percentage={field.value}
              onPercentageChange={(value) => {
                field.onChange(value)
                setValue("customValueInput", 0)
              }}
            />
          </div>
        )
      }}
    />
  )
}
