import {
  AddMoneyMarketLiquidityWrapperProps,
  AddStablepoolLiquidityForm,
} from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity"

import {
  TAddMoneyMarketLiquidityWrapperReturn,
  useAddGETHToOmnipool,
  useAddMoneyMarketLiquidity,
} from "./AddMoneyMarketLiquidity.utils"

export const AddGETHToOmnipool = ({
  formData,
  props,
}: {
  formData: TAddMoneyMarketLiquidityWrapperReturn
  props: AddMoneyMarketLiquidityWrapperProps
}) => {
  const addLiquidityData = useAddGETHToOmnipool({ props, formData })

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
