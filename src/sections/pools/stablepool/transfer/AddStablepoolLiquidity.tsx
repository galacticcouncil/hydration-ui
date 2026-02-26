import { FormProvider } from "react-hook-form"
import {
  AddStablepoolProps,
  AddStablepoolWrapperProps,
  getReservesZodSchema,
  stablepoolZodSchema,
  useAddStablepoolForm,
  useMaxBalances,
  useStablepoolExtimationTx,
  useStablepoolShares,
  useStablepoolSubmitHandler,
} from "./AddStablepoolLiquidity.utils"

import { useAddToOmnipoolZod } from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"
import { useAccountBalances } from "api/deposits"
import { AddLiquidityForm } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import {
  AddMoneyMarketStablepool,
  AddMoneyMarketStablepoolOmnipool,
  AddSplitMoneyMarketStablepool,
  AddSplitMoneyMarketStablepoolOmnipool,
  StablepoolForm,
} from "./AddMoneyMarketLiquidity"
import { ERC20_IN_OMNIPOOL } from "sections/pools/PoolsPage.utils"

export const AddStablepoolLiquidityWrapper = (
  props: AddStablepoolWrapperProps,
) => {
  const { data: accountBalances } = useAccountBalances()

  const {
    initialAmount,
    split,
    onAssetOpen,
    setLiquidityLimit,
    isStablepoolOnly,
    farms,
    reserves,
    stablepoolAsset,
    asset: { id: selectedAssetId, decimals },
  } = props

  const isMoveErc20ToOmnipool =
    ERC20_IN_OMNIPOOL.has(stablepoolAsset.id) &&
    ERC20_IN_OMNIPOOL.has(selectedAssetId)

  const initialAmounts = split
    ? reserves.map((reserve) => ({
        assetId: reserve.id,
        decimals: reserve.decimals,
        amount: "",
      }))
    : [{ assetId: selectedAssetId, decimals, amount: initialAmount ?? "" }]

  const transferableBalances = initialAmounts.map(({ assetId, decimals }) => ({
    assetId,
    decimals,
    balance:
      accountBalances?.accountAssetsMap.get(assetId)?.balance?.transferable ??
      "0",
  }))

  if (isMoveErc20ToOmnipool && !split) {
    return (
      <AddLiquidityForm
        selectedAssetId={selectedAssetId}
        poolId={stablepoolAsset.id}
        farms={farms}
        onClose={props.onClose}
        onSetLiquidityLimit={setLiquidityLimit}
        onAssetOpen={onAssetOpen}
        initialAmount={initialAmount}
      />
    )
  }

  if (stablepoolAsset.isErc20) {
    if (split)
      return isStablepoolOnly ? (
        <AddSplitMoneyMarketStablepool
          transferableBalances={transferableBalances}
          initialAmounts={initialAmounts}
          {...props}
        />
      ) : (
        <AddSplitMoneyMarketStablepoolOmnipool
          transferableBalances={transferableBalances}
          initialAmounts={initialAmounts}
          {...props}
        />
      )

    return isStablepoolOnly ? (
      <AddMoneyMarketStablepool
        transferableBalances={transferableBalances}
        initialAmounts={initialAmounts}
        {...props}
      />
    ) : (
      <AddMoneyMarketStablepoolOmnipool
        transferableBalances={transferableBalances}
        initialAmounts={initialAmounts}
        {...props}
      />
    )
  }

  return isStablepoolOnly ? (
    <StablepoolOnly
      transferableBalances={transferableBalances}
      initialAmounts={initialAmounts}
      {...props}
    />
  ) : (
    <StablepoolOmnipool
      transferableBalances={transferableBalances}
      initialAmounts={initialAmounts}
      {...props}
    />
  )
}

const StablepoolOnly = (props: AddStablepoolProps) => {
  const tx = useStablepoolExtimationTx(props)
  const balancesMax = useMaxBalances(props, tx)

  const { onSubmit } = useStablepoolSubmitHandler(props)
  const { form, handleSubmit } = useAddStablepoolForm(
    props,
    stablepoolZodSchema(balancesMax),
  )

  useStablepoolShares(props, form)

  return (
    <FormProvider {...form}>
      <StablepoolForm
        balancesMax={balancesMax}
        handleSubmit={handleSubmit(onSubmit)}
        {...props}
      />
    </FormProvider>
  )
}

const StablepoolOmnipool = (props: AddStablepoolProps) => {
  const tx = useStablepoolExtimationTx(props)
  const balancesMax = useMaxBalances(props, tx)

  const { onSubmit } = useStablepoolSubmitHandler(props)

  const { form, handleSubmit } = useAddStablepoolForm(
    props,
    useAddToOmnipoolZod(
      props.stablepoolAsset,
      props.stablepoolAsset.id,
      props.farms,
      getReservesZodSchema(balancesMax),
    ),
  )

  useStablepoolShares(props, form)

  return (
    <FormProvider {...form}>
      <StablepoolForm
        balancesMax={balancesMax}
        handleSubmit={handleSubmit(onSubmit)}
        {...props}
      />
    </FormProvider>
  )
}
