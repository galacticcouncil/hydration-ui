import * as React from "react"
import * as UI from "@galacticcouncil/ui"
import { createComponent } from "@lit-labs/react"
import { SContainer, SDivider, SPrice } from "./AssetPrice.styled"

export const UigcAssetPrice = createComponent({
  tagName: "uigc-asset-price",
  elementClass: UI.AssetPrice,
  react: React,
})

export function OrderAssetPrice(props: {
  inputAsset: string | undefined
  outputAsset: string | undefined
  price: string
}) {
  return (
    <SContainer>
      <SDivider></SDivider>
      {props.price && (
        <SPrice>
          <UigcAssetPrice
            inputAsset={props.inputAsset}
            outputAsset={props.outputAsset}
            outputBalance={props.price}
          />
        </SPrice>
      )}
    </SContainer>
  )
}
