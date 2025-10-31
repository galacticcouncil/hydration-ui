import { AssetIcon, X } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  Flex,
  Icon,
  MicroButton,
  NumberInput,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { spotPriceQuery } from "@/api/spotPrice"
import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly offerAsset: TAsset
  readonly buyAsset: TAsset
  readonly onChange: (price: string) => void
}

export const PlaceOrderPrice: FC<Props> = ({
  offerAsset,
  buyAsset,
  onChange,
}) => {
  const { t } = useTranslation(["trade", "common"])

  const { watch, getValues, reset, setValue, getFieldState } =
    useFormContext<PlaceOrderFormValues>()

  const [price, selectedOption, isPriceSwitched] = watch([
    "price",
    "priceGain",
    "isPriceSwitched",
  ])

  const rpc = useRpcProvider()
  const { data, isLoading } = useQuery(
    spotPriceQuery(rpc, offerAsset.id, buyAsset.id),
  )

  const actualomniPoolPrice = data?.spotPrice ?? "0"
  const switchedOmnipoolPrice =
    actualomniPoolPrice !== "NaN" && Big(actualomniPoolPrice).gt(0)
      ? Big(1).div(actualomniPoolPrice).toString()
      : actualomniPoolPrice

  const omniPoolPrice = isPriceSwitched
    ? switchedOmnipoolPrice
    : actualomniPoolPrice

  const adjustedOptions = marketPriceOptions.map((option) =>
    isPriceSwitched ? Big(option).times(-1).toString() : option,
  )

  const priceOptions = (
    !adjustedOptions.includes(selectedOption) && selectedOption
      ? adjustedOptions.map((priceOption) =>
          priceOption === "0" ? selectedOption : priceOption,
        )
      : adjustedOptions
  ).map((option) => {
    const optionPrice = Big(omniPoolPrice)
      .div(100)
      .times(Big(100).plus(option))
      .toString()

    return {
      option,
      optionPrice,
    }
  })

  useEffect(() => {
    if (isLoading) {
      return
    }

    const { price } = getValues()

    if (price === null && omniPoolPrice !== "NaN") {
      setValue("price", omniPoolPrice)
    }
  }, [omniPoolPrice, isLoading, getValues, setValue, getFieldState])

  const switchPrice = (): void => {
    const formValues = getValues()
    const priceBn = Big(formValues.price || "0")

    reset({
      ...formValues,
      isPriceSwitched: !isPriceSwitched,
      price: priceBn.eq(0) ? formValues.price : Big(1).div(priceBn).toString(),
      priceGain: selectedOption
        ? Big(selectedOption).times(-1).toString()
        : selectedOption,
    })
  }

  return (
    <Flex py={8} direction="column" gap={4}>
      <Flex justify="space-between" height={18} align="center">
        <Text fw={500} fs="p5" lh={px(14.4)} color={getToken("text.medium")}>
          {t("otc.placeOrder.priceFor1", {
            symbol: isPriceSwitched ? buyAsset.symbol : offerAsset.symbol,
          })}
        </Text>
        {isLoading || omniPoolPrice === "NaN" ? (
          <MicroButton disabled>
            {t("otc.placeOrder.lastOmniPoolPrice")}
          </MicroButton>
        ) : (
          <Flex align="center" gap={4}>
            {priceOptions.map(({ option, optionPrice }) => {
              const isCustom = !adjustedOptions.includes(option)
              const isSelected = selectedOption === option

              return (
                <MicroButton
                  key={option}
                  size="small"
                  variant={isSelected ? "emphasis" : "low"}
                  onClick={() => {
                    if (isCustom) {
                      setValue("price", omniPoolPrice)
                      setValue("priceGain", "0")
                      onChange(omniPoolPrice)
                      return
                    }

                    if (isSelected) {
                      return
                    }

                    setValue("price", optionPrice)
                    setValue("priceGain", option)
                    onChange(optionPrice)
                  }}
                >
                  {option === "0" ? (
                    t("otc.placeOrder.lastOmniPoolPrice")
                  ) : (
                    <Flex align="center">
                      {Big(option).gt(0) && "+"}
                      {t("common:percent", {
                        value: Big(option).toFixed(1, Big.roundDown),
                      })}
                      {isCustom && <Icon size={12} component={X} />}
                    </Flex>
                  )}
                </MicroButton>
              )
            })}
          </Flex>
        )}
      </Flex>
      <Flex justify="space-between" align="center">
        <Flex py={4} pl={4} gap={4} align="center">
          <ButtonIcon onClick={switchPrice}>
            <AssetIcon />
          </ButtonIcon>
          <Text fw={600} fs="p3" lh={px(14)} color={getToken("text.high")}>
            {isPriceSwitched ? offerAsset.symbol : buyAsset.symbol}
          </Text>
        </Flex>
        <NumberInput
          variant="embedded"
          value={price}
          onValueChange={({ value }) => {
            const selectedOption = priceOptions.find(
              ({ optionPrice }) => value === optionPrice,
            )

            if (selectedOption) {
              setValue("priceGain", selectedOption.option)
            } else if (omniPoolPrice !== "NaN") {
              const valueBig = Big(value || "0")

              if (valueBig.eq(0)) {
                setValue("priceGain", "")
              } else {
                const option = Big(value || "0")
                  .div(omniPoolPrice)
                  .minus(1)
                  .times(100)
                  .toString()

                setValue("priceGain", option)
              }
            }

            setValue("price", value)
            onChange(value)
          }}
          placeholder="0"
          sx={{
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1,
            color: getToken("text.high"),
            textAlign: "right",
          }}
        />
      </Flex>
    </Flex>
  )
}

const marketPriceOptions = [-3, -1, 0, 3, 5, 10].map((option) =>
  option.toString(),
)
