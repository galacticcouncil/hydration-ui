import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { preventDefault } from "@galacticcouncil/utils"
import React, { useEffect, useRef } from "react"
import { Controller } from "react-hook-form"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useTipForm } from "@/modules/transactions/review/ReviewTransactionTip/components/TipForm.form"

import { TipInput } from "./TipInput"

type TipFormProps = {
  assetId: string
  onAmountChange: (amount: string) => void
}

export const TipForm: React.FC<TipFormProps> = ({
  assetId,
  onAmountChange,
}) => {
  const { watch, control, subscribe } = useTipForm({ assetId })

  const [amount, asset] = watch(["amount", "asset"])
  const [tipUsd] = useDisplayAssetPrice(assetId, amount || "0")

  const onAmountChangeRef = useRef(onAmountChange)
  useEffect(() => {
    onAmountChangeRef.current = onAmountChange
  }, [onAmountChange])

  useEffect(() => {
    return subscribe({
      formState: {
        values: true,
        isValid: true,
      },
      callback: ({ values, isValid }) => {
        onAmountChangeRef.current(isValid ? values.amount : "0")
      },
    })
  }, [subscribe])

  return (
    <form onSubmit={preventDefault}>
      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Stack gap={2} align="end">
            <TipInput
              value={field.value}
              unit={asset?.symbol}
              isError={!!error}
              onValueChange={({ value }) => field.onChange(value)}
            />
            <Text
              align="end"
              fs={11}
              color={getToken(
                error ? "accents.danger.secondary" : "text.medium",
              )}
            >
              {error?.message || tipUsd}
            </Text>
          </Stack>
        )}
      />
    </form>
  )
}
