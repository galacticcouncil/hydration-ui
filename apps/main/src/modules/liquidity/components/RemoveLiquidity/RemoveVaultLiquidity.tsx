import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { RemoveLiquidityForm } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquidity"
import { useRemoveLiquidityForm } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquidity.utils"
import { RemoveLiquiditySkeleton } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquiditySkeleton"
import { useVaultWithdraw } from "@/modules/liquidity/components/RemoveLiquidity/RemoveVaultLiquidity.utils"
import { useLiquidityMinLimit } from "@/modules/liquidity/Liquidity.utils"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"
import { TShareToken, useAssets } from "@/providers/assetsProvider"
import { scale, scaleHuman } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

type Props = {
  vault: VaultTable
  onBack?: () => void
  closable?: boolean
  onSubmitted: () => void
}

const SHARE_DECIMALS = 18

const useRemoveVaultLiquidity = ({
  vault,
  onSubmitted,
}: Pick<Props, "vault" | "onSubmitted">) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { getAssetWithFallback } = useAssets()
  const withdraw = useVaultWithdraw()

  const state = vault.vault
  const [token0, token1] = vault.tokens

  const shareMeta = {
    // hypervisor share isn't in the asset registry
    id: state?.address ?? vault.id,
    symbol: state?.shareSymbol ?? t("common:shares"),
    decimals: SHARE_DECIMALS,
    iconId: [token0.id, token1.id],
  } as unknown as TShareToken

  const heldShifted = scaleHuman(
    vault.positionShares.toString(),
    SHARE_DECIMALS,
  )

  const form = useRemoveLiquidityForm({
    asset: shareMeta,
    initialAmount: heldShifted,
    rule: required.pipe(positive).check(validateFieldMaxBalance(heldShifted)),
  })

  const amountShifted = form.watch("amount") || "0"
  const removeShares = scale(amountShifted, SHARE_DECIMALS)

  const displayValue =
    vault.positionValueDisplay && Big(heldShifted).gt(0)
      ? t("currency", {
          value: Big(vault.positionValueDisplay)
            .times(amountShifted)
            .div(heldShifted)
            .toString(),
        })
      : undefined

  const receiveAssets =
    state && state.totalSupply > 0n
      ? [
          { total: state.total0, id: token0.id },
          { total: state.total1, id: token1.id },
        ].map(({ total, id }) => ({
          asset: getAssetWithFallback(id),
          value: Big(total.toString())
            .times(removeShares)
            .div(state.totalSupply.toString())
            .toFixed(0),
        }))
      : []

  const getMinLimit = useLiquidityMinLimit()

  const minAmounts =
    state && state.totalSupply > 0n
      ? ([
          state.base.amount0,
          state.base.amount1,
          state.limit.amount0,
          state.limit.amount1,
        ].map((amount) =>
          BigInt(
            getMinLimit(
              Big(amount.toString())
                .times(removeShares)
                .div(state.totalSupply.toString())
                .toFixed(0),
            ),
          ),
        ) as [bigint, bigint, bigint, bigint])
      : ([0n, 0n, 0n, 0n] as [bigint, bigint, bigint, bigint])

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!state) throw new Error("Vault not found")

      await withdraw({
        vault: state,
        shares: BigInt(Big(removeShares).toFixed(0)),
        minAmounts,
      })

      onSubmitted()
    },
  })

  if (!state) return undefined

  return {
    form,
    meta: shareMeta,
    receiveAssets,
    totalPositionShifted: heldShifted,
    displayValue,
    mutation,
    editable: true,
    receiveNote: t("liquidity:vaults.remove.dualAssetNote"),
    isIsolatedPool: true,
  }
}

export const RemoveVaultLiquidity = ({ vault, ...props }: Props) => {
  const removeLiquidity = useRemoveVaultLiquidity({
    vault,
    onSubmitted: props.onSubmitted,
  })

  if (!removeLiquidity) return <RemoveLiquiditySkeleton onBack={props.onBack} />

  const { form, ...removeLiquidityData } = removeLiquidity

  return (
    <FormProvider {...form}>
      <RemoveLiquidityForm
        poolId={vault.id}
        {...props}
        {...removeLiquidityData}
      />
    </FormProvider>
  )
}
