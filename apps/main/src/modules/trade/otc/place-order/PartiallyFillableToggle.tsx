import { PartialFill } from "@galacticcouncil/ui/assets/icons"
import { Flex, Text, Toggle } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Controller } from "react-hook-form"

import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/placeOrderSchema"

export const PartiallyFillableToggle: FC = () => {
  // px containers/paddings/primary
  return (
    <Flex py={16} px={20} direction="column">
      <Flex justify="space-between" align="center">
        <Flex gap={4} align="center">
          <PartialFill color={getToken("icons.primary")} />
          <Text fw={500} fs={14} lh={px(22)} color={getToken("text.high")}>
            Partially fillable
          </Text>
        </Flex>
        <Controller<PlaceOrderFormValues>
          name="isPartiallyFillable"
          render={({ field }) => (
            <Toggle
              size="large"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </Flex>
      <Text fs={12} lh={px(15.6)} color={getToken("text.medium")}>
        Allow users to fill smaller parts of this offer
      </Text>
    </Flex>
  )
}
