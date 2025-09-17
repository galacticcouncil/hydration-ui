import { AssetIcon } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  Flex,
  Input,
  MicroButton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { spotPrice } from "@/api/spotPrice"
import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly offerAsset: TAsset
  readonly buyAsset: TAsset
  readonly onChange: (price: string) => void
  readonly onSwitch: () => void
}

export const PlaceOrderPrice: FC<Props> = ({
  offerAsset,
  buyAsset,
  onChange,
  onSwitch,
}) => {
  const { t } = useTranslation("trade")
  const { control } = useFormContext<PlaceOrderFormValues>()

  const rpc = useRpcProvider()
  const { data, isLoading } = useQuery(
    spotPrice(rpc, offerAsset.id, buyAsset.id),
  )

  const omniPoolPrice = data?.spotPrice ?? "0"

  return (
    <Controller
      control={control}
      name="price"
      render={({ field }) => (
        <Flex py={8} direction="column" gap={4}>
          <Flex justify="space-between" height={18} align="center">
            <Text
              fw={500}
              fs="p5"
              lh={px(14.4)}
              color={getToken("text.medium")}
            >
              {t("otc.placeOrder.priceFor1", {
                symbol: offerAsset.symbol,
              })}
            </Text>
            <MicroButton
              onClick={() => {
                field.onChange(omniPoolPrice)
                onChange(omniPoolPrice)
              }}
              disabled={isLoading || omniPoolPrice === "NaN"}
            >
              {t("otc.placeOrder.lastOmniPoolPrice")}
            </MicroButton>
          </Flex>
          <Flex justify="space-between" align="center">
            <Flex py={4} pl={4} gap={4} align="center">
              <ButtonIcon onClick={onSwitch}>
                <AssetIcon />
              </ButtonIcon>
              <Text fw={600} fs="p3" lh={px(14)} color={getToken("text.high")}>
                {buyAsset.symbol}
              </Text>
            </Flex>
            <Input
              variant="embedded"
              value={field.value}
              onChange={(e) => {
                field.onChange(e)
                onChange(e.target.value)
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
      )}
    />
  )
}
