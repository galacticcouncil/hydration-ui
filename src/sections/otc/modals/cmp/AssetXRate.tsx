import * as React from "react"
import * as UI from "@galacticcouncil/ui"
import { createComponent, EventName } from "@lit-labs/react"
import { useTranslation } from "react-i18next"

export const UigcAssetXRate = createComponent({
  tagName: "uigc-asset-x-rate",
  elementClass: UI.AssetXRate,
  react: React,
  events: {
    onAssetInputChanged: "asset-input-changed" as EventName<CustomEvent>,
  },
})

export const UigcButton = createComponent({
  tagName: "uigc-button",
  elementClass: UI.Button,
  react: React,
})

export function OrderAssetRate(props: {
  inputAsset: string | undefined
  outputAsset: string | undefined
  price: string
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  return (
    <UigcAssetXRate
      sx={{ pt: 10, pb: 10 }}
      onAssetInputChanged={(e) => props.onChange(e.detail.value)}
      title={t("otc.order.place.price", { symbol: props.inputAsset })}
      asset={props.outputAsset}
      amount={props.price}
    >
      <UigcButton
        slot="button"
        {...{ variant: "max", size: "micro", nowrap: true }}
      >
        Last omnipool price
      </UigcButton>
    </UigcAssetXRate>
  )
}
