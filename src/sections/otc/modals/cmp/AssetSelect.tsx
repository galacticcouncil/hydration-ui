import * as React from "react"
import * as UI from "@galacticcouncil/ui"
import { createComponent, EventName } from "@lit-labs/react"
import { u32 } from "@polkadot/types"
import { useAsset } from "api/asset"
import { useTokenBalance } from "api/balances"
import { useAssetsModal } from "sections/assets/AssetsModal.utils"
import { useAccountStore } from "state/store"

export const UigcAssetTransfer = createComponent({
  tagName: "uigc-asset-transfer",
  elementClass: UI.AssetTransfer,
  react: React,
  events: {
    onAssetInputChanged: "asset-input-changed" as EventName<CustomEvent>,
    onAssetSelectorClicked: "asset-selector-clicked" as EventName<CustomEvent>,
  },
})

export const UigcAssetBalance = createComponent({
  tagName: "uigc-asset-balance",
  elementClass: UI.AssetBalance,
  react: React,
})

export function OrderAssetSelect(props: {
  name: string
  value: string
  title?: string
  asset: string | u32
  onChange: (value: string) => void
  onAssetChange: (asset: u32 | string) => void
  error?: string
}) {
  const { account } = useAccountStore()
  const asset = useAsset(props.asset)
  const balance = useTokenBalance(props.asset, account?.address)

  const { openModal, modal } = useAssetsModal({
    onSelect: props.onAssetChange,
  })

  const assetBalance = balance.data?.balance
  const assetDecimals = asset.data?.decimals

  let blnc: string = ""
  if (assetBalance && assetDecimals) {
    blnc = assetBalance.shiftedBy(-1 * assetDecimals.toNumber()).toFixed()
  }

  return (
    <>
      {modal}
      <UigcAssetTransfer
        onAssetInputChanged={(e) => props.onChange(e.detail.value)}
        onAssetSelectorClicked={openModal}
        id={props.name}
        title={props.title}
        asset={asset.data?.symbol}
        amount={props.value}
        error={props.error}
      >
        <UigcAssetBalance
          slot="balance"
          balance={blnc}
          onMaxClick={() => props.onChange(blnc)}
        />
      </UigcAssetTransfer>
    </>
  )
}

export function OrderAssetPay(props: {
  name: string
  value: string
  title?: string
  asset: string | u32
  error?: string
}) {
  const { account } = useAccountStore()
  const asset = useAsset(props.asset)
  const balance = useTokenBalance(props.asset, account?.address)

  const assetBalance = balance.data?.balance
  const assetDecimals = asset.data?.decimals

  let blnc: string = ""
  if (assetBalance && assetDecimals) {
    blnc = assetBalance.shiftedBy(-1 * assetDecimals.toNumber()).toFixed()
  }

  return (
    <UigcAssetTransfer
      id={props.name}
      title={props.title}
      asset={asset.data?.symbol}
      amount={props.value}
      error={props.error}
      selectable={false}
      readonly={true}
    >
      <UigcAssetBalance slot="balance" balance={blnc} visible={false} />
    </UigcAssetTransfer>
  )
}

export function OrderAssetGet(props: {
  name: string
  value: string
  title?: string
  asset: string | u32
  onChange: (value: string) => void
  error?: string
  readonly?: boolean
}) {
  const asset = useAsset(props.asset)
  return (
    <UigcAssetTransfer
      onAssetInputChanged={(e) => props.onChange(e.detail.value)}
      id={props.name}
      title={props.title}
      asset={asset.data?.symbol}
      amount={props.value}
      error={props.error}
      selectable={false}
      readonly={props.readonly || false}
    ></UigcAssetTransfer>
  )
}
