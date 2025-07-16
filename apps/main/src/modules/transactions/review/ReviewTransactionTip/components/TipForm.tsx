import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { preventDefault } from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import React, { useEffect, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod/v4"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { TAsset } from "@/providers/assetsProvider"
import {
  positive,
  required,
  requiredObject,
  useValidateFormMaxBalance,
} from "@/utils/validators"

import { TipInput } from "./TipInput"

type TipFormValues = { amount: string; asset: TAsset }

type TipFormProps = {
  asset: TAsset
  onAmountChange: (amount: string) => void
}

const schema = z.object({
  amount: required.pipe(positive),
  asset: requiredObject<TAsset>(),
})

export const TipForm: React.FC<TipFormProps> = ({ asset, onAmountChange }) => {
  const refineMaxBalance = useValidateFormMaxBalance()

  const { watch, control, subscribe } = useForm<TipFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset,
    },
    resolver: standardSchemaResolver(
      schema.check(
        refineMaxBalance("amount", (form) => [form.asset, form.amount]),
      ),
    ),
  })

  const amount = watch("amount")
  const [tipUsd] = useDisplayAssetPrice(asset.id, amount || "0")

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
              unit={asset.symbol}
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
