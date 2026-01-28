import { PartialFill } from "@galacticcouncil/ui/assets/icons"
import { Flex, Text, Toggle } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"

export const PartiallyFillableToggle: FC = () => {
  const { t } = useTranslation("trade")
  const { control } = useFormContext<PlaceOrderFormValues>()

  return (
    <Flex py="l" px="xl" direction="column">
      <Flex justify="space-between" align="center">
        <Flex gap="s" align="center">
          <PartialFill sx={{ color: getToken("icons.primary") }} />
          <Text fw={500} fs="p3" lh="l" color={getToken("text.high")}>
            {t("otc.fillOrder.partiallyFillable.title")}
          </Text>
        </Flex>
        <Controller
          control={control}
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
      <Text fs="p5" lh="s" color={getToken("text.medium")}>
        {t("otc.fillOrder.partiallyFillable.description")}
      </Text>
    </Flex>
  )
}
