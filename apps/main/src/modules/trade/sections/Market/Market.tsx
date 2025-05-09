import { Button, Flex, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { DynamicFee, DynamicFeeRangeType } from "@/components"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { Summary } from "@/components/Summary"
import { useAssets } from "@/providers/assetsProvider"
import { Route } from "@/routes/_trade/trade.swap.market"

import { AssetSwitcher, TradeOption, TradeRoutes } from "./components"
import { useMarketValidation } from "./Market.utils"

type SwapType = "swap" | "twap"

type FormValues = {
  sell: string
  buy: string
  type: SwapType
  sellAsset: TAssetData | undefined
  buyAsset: TAssetData | undefined
}

const range: Record<DynamicFeeRangeType, number> = {
  low: 1,
  middle: 1.5,
  high: 2,
}

export const Market = () => {
  const { t } = useTranslation(["common", "trade"])
  const { tradable, getAsset } = useAssets()

  const { account } = useAccount()
  const { assetOut } = Route.useSearch()

  const form = useForm<FormValues>({
    defaultValues: {
      sell: "",
      buy: "",
      type: "swap",
      buyAsset: assetOut ? getAsset(assetOut) : undefined,
    },
    mode: "onChange",
    resolver: zodResolver(useMarketValidation()),
  })

  const [sellAsset, buyAsset] = form.watch(["sellAsset", "buyAsset"])

  const onSwitchAssets = () => {
    const { buy, sell, sellAsset, buyAsset } = form.getValues()

    form.setValue("buy", sell)
    form.setValue("sell", buy)
    form.setValue("sellAsset", buyAsset)
    form.setValue("buyAsset", sellAsset)
  }

  return (
    <form onSubmit={form.handleSubmit(() => null)}>
      <Flex direction="column">
        <Controller<FormValues, "sell">
          name="sell"
          control={form.control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <AssetSelect
              label={t("sell")}
              value={value}
              onChange={onChange}
              assets={tradable}
              selectedAsset={sellAsset}
              setSelectedAsset={(asset) => form.setValue("sellAsset", asset)}
              error={error?.message}
            />
          )}
        />

        <AssetSwitcher onSwitchAssets={onSwitchAssets} />

        <Controller<FormValues, "buy">
          name="buy"
          control={form.control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <AssetSelect
              label={t("buy")}
              value={value}
              onChange={onChange}
              assets={tradable}
              selectedAsset={buyAsset}
              setSelectedAsset={(asset) => form.setValue("buyAsset", asset)}
              error={error?.message}
              maxBalance="10000"
            />
          )}
        />

        <Controller<FormValues, "type">
          name="type"
          control={form.control}
          render={({ field: { value, onChange } }) => (
            <Flex sx={{ flexDirection: "column", gap: 8, pt: 8, pb: 12 }}>
              <TradeOption
                id="swap"
                value="12345.222"
                displayValue="999"
                active={"swap" === value}
                onClick={onChange}
                label={t("trade:market.form.type.single")}
                time="Instant execution"
              />
              <TradeOption
                id="twap"
                value="6789110"
                displayValue="1000"
                diff="1233"
                active={"twap" === value}
                onClick={onChange}
                label={t("trade:market.form.type.split")}
                time="Instant execution"
              />
            </Flex>
          )}
        />

        <Separator mx={-20} />
        <Summary
          separator={<Separator mx={-20} />}
          withTrailingSeparator
          rows={[
            {
              label: "Price impact:",
              content: t("percent", { value: "5" }),
            },
            {
              label: "Est. trade fees:",
              content: (
                <DynamicFee
                  range={range}
                  value={2.5}
                  tooltip="Some information about trade fees"
                />
              ),
            },
            {
              label: "Minimal  received:",
              content: "33 456.56 HDX",
            },
          ]}
        />
        <TradeRoutes routes={["HDX", "DOT", "USDT"]} />
        <Separator mx={-20} />
        <Flex
          sx={{
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
            p: 20,
          }}
        >
          {account ? (
            <Button size="large" width="100%">
              Swap
            </Button>
          ) : (
            <Web3ConnectButton size="large" width="100%" />
          )}

          <Text fs="p5" fw={400} color={getToken("text.high")}>
            Budget & fee will be reserved for this trade.
          </Text>
        </Flex>
      </Flex>
    </form>
  )
}
