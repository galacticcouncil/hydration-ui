import * as React from "react"
import * as UI from "@galacticcouncil/ui"
import { createComponent, EventName } from "@lit-labs/react"
import { u32 } from "@polkadot/types"
import { useAsset } from "api/asset"
import { useTokenBalance } from "api/balances"
import { useAccountStore } from "state/store"
import BN from "bignumber.js"

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

export const UigcButton = createComponent({
  tagName: "uigc-button",
  elementClass: UI.Button,
  react: React,
})

export function OrderAssetSelect(props: {
  name: string
  value: string
  title?: string
  asset: string | u32
  onChange: (value: string) => void
  onOpen: () => void
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
      onAssetInputChanged={(e) => props.onChange(e.detail.value)}
      onAssetSelectorClicked={props.onOpen}
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
  )
}

export function OrderAssetPay(props: {
  name?: string
  title?: string
  value: string
  asset: string | u32
  onChange?: (value: string) => void
  error?: string
  readonly?: boolean
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
      ref={(el) => el && props.readonly && el.setAttribute("readonly", "")}
      onAssetInputChanged={(e) =>
        props.onChange && props.onChange(e.detail.value)
      }
      id={props.name}
      title={props.title}
      asset={asset.data?.symbol}
      amount={props.value}
      error={props.error}
      selectable={false}
      readonly={props.readonly || false}
    >
      <UigcAssetBalance slot="balance" balance={blnc} visible={false} />
    </UigcAssetTransfer>
  )
}

function getPercentageValue(value: BN, pct: number): BN {
  return value.div(100).multipliedBy(new BN(pct))
}

const OrderAssetPctBtn = (
  pct: number,
  remaining: BN,
  onClick: (value: string) => void,
) => (
  <UigcButton
    slot="button"
    onClick={() => {
      const res = getPercentageValue(remaining, pct)
      onClick(res.toFixed())
    }}
    {...{ variant: "max", size: "micro", nowrap: true }}
  >
    {pct + "%"}
  </UigcButton>
)

export function OrderAssetGet(props: {
  name?: string
  title?: string
  value: string
  remaining: BN
  asset: string | u32
  onChange?: (value: string) => void
  error?: string
  readonly?: boolean
}) {
  const asset = useAsset(props.asset)
  return (
    <UigcAssetTransfer
      ref={(el) => el && props.readonly && el.setAttribute("readonly", "")}
      onAssetInputChanged={(e) =>
        props.onChange && props.onChange(e.detail.value)
      }
      id={props.name}
      title={props.title}
      asset={asset.data?.symbol}
      amount={props.value}
      error={props.error}
      selectable={false}
      readonly={props.readonly || false}
    >
      {props.onChange && (
        <div slot="balance" sx={{ display: "flex", justify: "end", gap: 2 }}>
          {OrderAssetPctBtn(25, props.remaining, props.onChange)}
          {OrderAssetPctBtn(50, props.remaining, props.onChange)}
          {OrderAssetPctBtn(75, props.remaining, props.onChange)}
          {OrderAssetPctBtn(100, props.remaining, props.onChange)}
        </div>
      )}
    </UigcAssetTransfer>
  )
}
