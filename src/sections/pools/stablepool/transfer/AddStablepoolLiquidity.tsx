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
import { GETH_ERC20_ASSET_ID } from "utils/constants"
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

  const isMoveGETHToOmnipool =
    stablepoolAsset.id === GETH_ERC20_ASSET_ID &&
    selectedAssetId === GETH_ERC20_ASSET_ID

  const initialAmounts = split
    ? reserves.map((reserve) => ({
        assetId: reserve.asset_id.toString(),
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

  if (isMoveGETHToOmnipool && !split) {
    return (
      <AddLiquidityForm
        assetId={selectedAssetId}
        farms={farms}
        onClose={props.onClose}
        setLiquidityLimit={setLiquidityLimit}
        onAssetOpen={onAssetOpen}
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
