import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import BN from "bignumber.js"
import { useShallow } from "hooks/useShallow"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useUserExternalTokenStore } from "sections/wallet/addToken/AddToken.utils"
import { Transaction, useSettingsStore, useStore } from "state/store"
import { QUERY_KEYS } from "utils/queryKeys"
import { maxBalance, required } from "utils/validators"
import { ZodType, z } from "zod"
import { createToastMessages } from "state/toasts"
import { ApiPromise } from "@polkadot/api"
import { useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccountBalances } from "api/deposits"

type XYKAsset = {
  id: string
  amount: string
  decimals: number
}

export type CreateXYKPoolFormData = {
  assetAId: string
  assetAAmount: string
  assetBId: string
  assetBAmount: string
}

export const createXYKPoolFormSchema = (
  balanceA: string,
  decimalsA: number,
  balanceB: string,
  decimalsB: number,
): ZodType<CreateXYKPoolFormData> =>
  z.object({
    assetAId: required,
    assetAAmount: required.pipe(maxBalance(balanceA, decimalsA)),
    assetBId: required,
    assetBAmount: required.pipe(maxBalance(balanceB, decimalsB)),
  })

export const createPoolExclusivityMap = (xykPoolsAssets: string[][]) => {
  return xykPoolsAssets.reduce<Record<string, string[]>>((memo, [idA, idB]) => {
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
}

export const filterIdsByExclusivity = (
  exclusiveId: string,
  ids: string[],
  map: Record<string, string[]>,
) => ids.filter((id) => id !== exclusiveId && !map[exclusiveId]?.includes(id))

export const useAllowedXYKPoolAssets = () => {
  const { all, isExternal } = useAssets()
  const degenMode = useSettingsStore(useShallow((s) => s.degenMode))
  const { isAdded } = useUserExternalTokenStore()

  const { data } = useAccountBalances()

  return useMemo(() => {
    return [...all.values()].filter((asset) => {
      const isTradable = asset.isTradable
      const hasBalance = BN(
        data?.accountAssetsMap.get(asset.id)?.balance?.transferable ?? "0",
      ).gt(0)

      const isNotTradableWithBalance = !isTradable && hasBalance

      const shouldBeVisible = isTradable || isNotTradableWithBalance

      if (isExternal(asset)) {
        return shouldBeVisible && (degenMode || isAdded(asset.externalId))
      }

      return shouldBeVisible
    })
  }, [all, degenMode, isAdded, isExternal, data?.accountAssetsMap])
}

export const useCreateXYKPoolForm = (assetA?: string, assetB?: string) => {
  const { isLoaded } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()

  const assetAMeta = isLoaded ? getAssetWithFallback(assetA ?? "") : null
  const assetBMeta = isLoaded ? getAssetWithFallback(assetB ?? "") : null

  const { data: accountAssets } = useAccountBalances()
  const balanceA = assetA
    ? accountAssets?.accountAssetsMap.get(assetA)?.balance
    : undefined
  const balanceB = assetB
    ? accountAssets?.accountAssetsMap.get(assetB)?.balance
    : undefined

  return useForm<CreateXYKPoolFormData>({
    mode: "onChange",
    resolver: zodResolver(
      createXYKPoolFormSchema(
        balanceA?.transferable ?? "0",
        assetAMeta?.decimals ?? 0,
        balanceB?.transferable ?? "0",
        assetBMeta?.decimals ?? 0,
      ),
    ),
    defaultValues: {
      assetAId: assetA ?? "",
      assetBId: assetB ?? "",
      assetAAmount: "",
      assetBAmount: "",
    },
  })
}

export const createXYKpool = (
  api: ApiPromise,
  assetA: XYKAsset,
  assetB: XYKAsset,
) => {
  return api.tx.xyk.createPool(
    assetA.id,
    BN(assetA.amount).shiftedBy(assetA.decimals).toFixed(),
    assetB.id,
    BN(assetB.amount).shiftedBy(assetB.decimals).toFixed(),
  )
}

export const useCreateXYKPool = ({
  onClose,
  onSubmitted,
  onSuccess,
  steps,
}: {
  onClose?: () => void
  onSubmitted?: () => void
  onSuccess?: () => void
  steps?: Transaction["steps"]
} = {}) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const { api, isLoaded } = useRpcProvider()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  return useMutation(async (values: CreateXYKPoolFormData) => {
    const assetAMeta = isLoaded
      ? getAssetWithFallback(values.assetAId ?? "")
      : null
    const assetBMeta = isLoaded
      ? getAssetWithFallback(values.assetBId ?? "")
      : null
    if (!assetAMeta || !assetBMeta) throw new Error("Assets not found")

    const data = {
      assetA: {
        id: assetAMeta.id,
        amount: values.assetAAmount,
        decimals: assetAMeta.decimals,
      },
      assetB: {
        id: assetBMeta.id,
        amount: values.assetBAmount,
        decimals: assetBMeta.decimals,
      },
    }

    return await createTransaction(
      {
        title: t("liquidity.pool.xyk.create.modal.title"),
        description: t("liquidity.pool.xyk.create.modal.description", {
          assetAAmount: data.assetA.amount,
          assetASymbol: assetAMeta.symbol,
          assetBAmount: data.assetB.amount,
          assetBSymbol: assetBMeta.symbol,
        }),
        tx: createXYKpool(api, data.assetA, data.assetB),
      },
      {
        steps,
        onClose,
        onBack: () => {},
        onSubmitted,
        onSuccess: () => {
          queryClient.refetchQueries(QUERY_KEYS.xykPools)
          onSuccess?.()
        },
        toast: createToastMessages("liquidity.pool.xyk.create.toast", {
          t,
          tOptions: {
            symbolA: assetAMeta.symbol,
            symbolB: assetBMeta.symbol,
          },
          components: ["span", "span.highlight"],
        }),
      },
    )
  })
}
