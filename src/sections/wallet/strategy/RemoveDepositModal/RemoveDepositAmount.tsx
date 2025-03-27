import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { RemoveDepositFormValues } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal.form"
import { RemoveDepositBalance } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositBalance"
import { Slider } from "components/Slider/Slider"
import { ShareTokenAmount } from "sections/wallet/strategy/RemoveDepositModal/ShareTokenAmount"
import { BigNumber } from "bignumber.js"

type Props = {
  readonly assetId: string
  readonly balance: string
}

export const RemoveDepositAmount: FC<Props> = ({ assetId, balance }) => {
  const { control, setValue } = useFormContext<RemoveDepositFormValues>()

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
                <RemoveDepositBalance
                  balanceToSell={balanceToSell}
                  percentage={field.value}
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
                }}
              />
            </div>
            <ShareTokenAmount
              balance={balance}
              percentage={field.value}
              onPercentageChange={field.onChange}
            />
          </div>
        )
      }}
    />
  )
}
