import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { TAssetData } from "@/api/assets"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTransactionsStore } from "@/states/transactions"
import {
  positive,
  required,
  requiredObject,
  useValidateFormMaxBalance,
} from "@/utils/validators"

const schema = z.object({
  assetA: requiredObject<TAsset>(),
  amountA: required.pipe(positive),
  assetB: requiredObject<TAsset>(),
  amountB: required.pipe(positive),
})

export type CreateIsolatedPoolFormData = z.infer<typeof schema>

const useSchema = () => {
  const refineFormMaxBalance = useValidateFormMaxBalance()

  return schema.check(
    refineFormMaxBalance("amountA", (form) => [form.assetA, form.amountA]),
    refineFormMaxBalance("amountB", (form) => [form.assetB, form.amountB]),
  )
}

const defaultValues: CreateIsolatedPoolFormData = {
  assetA: null,
  amountA: "",
  assetB: null,
  amountB: "",
}

export const useIsolatedPoolForm = () => {
  return useForm<CreateIsolatedPoolFormData>({
    mode: "onChange",
    defaultValues,
    resolver: standardSchemaResolver(useSchema()),
  })
}

export const useSubmitCreateIsolatedPool = ({
  onSubmitted,
}: {
  onSubmitted: () => void
}) => {
  const { t } = useTranslation("liquidity")
  const { papi } = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({
      assetA,
      assetB,
      amountA,
      amountB,
    }: {
      assetA: TAssetData
      assetB: TAssetData
      amountA: string
      amountB: string
    }): Promise<void> => {
      const tx = papi.tx.XYK.create_pool({
        asset_a: Number(assetA.id),
        amount_a: BigInt(Big(amountA).toFixed(0)),
        asset_b: Number(assetB.id),
        amount_b: BigInt(Big(amountB).toFixed(0)),
      })

      const tOptions = { assetA: assetA.symbol, assetB: assetB.symbol }

      const toasts = {
        submitted: t("liquidity.createPool.toast.submitted", tOptions),
        success: t("liquidity.createPool.toast.success", tOptions),
        error: t("liquidity.createPool.toast.submitted", tOptions),
      }

      await createTransaction({ tx, toasts }, { onSubmitted })
    },
  })
}

export const createPoolExclusivityMap = (
  xykPoolsAssets: ReadonlyArray<readonly [a: string, idB: string]>,
): Readonly<Record<string, ReadonlyArray<string>>> =>
  xykPoolsAssets.reduce<Record<string, string[]>>((memo, [idA, idB]) => {
    if (!memo[idA]) {
      memo[idA] = []
    }
    if (!memo[idB]) {
      memo[idB] = []
    }
    if (!memo[idA].includes(idB)) {
      memo[idA].push(idB)
    }
    if (!memo[idB].includes(idA)) {
      memo[idB].push(idA)
    }
    return memo
  }, {})

export const filterIdsByExclusivity = (
  exclusiveId: string | undefined,
  assets: TAsset[],
  map: ReturnType<typeof createPoolExclusivityMap>,
) =>
  assets.filter(
    (asset) =>
      !exclusiveId ||
      (asset.id !== exclusiveId && !map[exclusiveId]?.includes(asset.id)),
  )

export const useAllowedXYKPoolAssets = () => {
  const { tradable } = useAssets()
  const { getTransferableBalance } = useAccountBalances()

  return useMemo(
    () => tradable.filter((asset) => getTransferableBalance(asset.id) > 0n),
    [tradable, getTransferableBalance],
  )
}
