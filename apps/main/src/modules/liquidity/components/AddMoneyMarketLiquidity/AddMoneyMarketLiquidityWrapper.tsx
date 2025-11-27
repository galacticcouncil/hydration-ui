import {
  AddMoneyMarketLiquidityWrapperProps,
  AddStablepoolLiquidityForm,
} from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity"

import {
  TAddMoneyMarketLiquidityWrapperReturn,
  useAddMoneyMarketLiquidity,
  useAddMoneyMarketOmnipoolLiquidity,
} from "./AddMoneyMarketLiquidity.utils"

export const AddGETHToOmnipool = ({
  formData,
  props,
}: {
  formData: TAddMoneyMarketLiquidityWrapperReturn
  props: AddMoneyMarketLiquidityWrapperProps
}) => {
  const addLiquidityData = useAddMoneyMarketOmnipoolLiquidity({
    props,
    formData,
  })

  return <AddStablepoolLiquidityForm {...props} {...addLiquidityData} />
}

export const AddMoneyMarketLiquidity = ({
  formData,
  props,
}: {
  formData: TAddMoneyMarketLiquidityWrapperReturn
  props: AddMoneyMarketLiquidityWrapperProps
}) => {
  const addLiquidityData = useAddMoneyMarketLiquidity({ props, formData })

  return <AddStablepoolLiquidityForm {...props} {...addLiquidityData} />
}
