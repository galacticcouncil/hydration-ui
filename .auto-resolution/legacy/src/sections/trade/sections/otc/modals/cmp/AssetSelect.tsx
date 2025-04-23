import * as React from "react"
import { u32 } from "@polkadot/types"
import BN from "bignumber.js"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { Button } from "components/Button/Button"

export function OrderAssetSelect(props: {
  name: string
  value: string
  title?: string
  asset?: string | u32
  balance?: BN | undefined
  onChange: (value: string) => void
  onOpen: () => void
  error?: string
}) {
  return (
    <WalletTransferAssetSelect
      name={props.name ?? ""}
      value={props.value}
      title={props.title}
      asset={props.asset?.toString() ?? ""}
      error={props.error}
      onChange={(value) => (props.onChange ? props.onChange(value) : undefined)}
      onAssetOpen={props.onOpen}
    />
  )
}

export function OrderAssetPay(props: {
  name?: string
  title?: string
  value: string
  asset: string | u32
  balance?: BN | undefined
  onChange?: (value: string) => void
  error?: string
  readonly?: boolean
}) {
  return (
    <WalletTransferAssetSelect
      name={props.name ?? ""}
      value={props.value}
      title={props.title}
      asset={props.asset.toString()}
      disabled={props.readonly}
      error={props.error}
      withoutMaxBtn
      onChange={(value) => (props.onChange ? props.onChange(value) : undefined)}
    />
  )
}

function getPercentageValue(value: BN, pct: number): BN {
  return value.div(100).multipliedBy(new BN(pct))
}

const OrderAssetPctBtn: React.FC<{
  pct: number
  remaining: BN
  onClick: (value: string) => void
}> = ({ pct, remaining, onClick }) => (
  <Button
    variant="outline"
    size="micro"
    type="button"
    onClick={() => {
      const res = getPercentageValue(remaining, pct)
      onClick(res.toFixed())
    }}
  >
    {pct + "%"}
  </Button>
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
  return (
    <div css={{ position: "relative" }}>
      <div>
        <WalletTransferAssetSelect
          sx={{ display: "block" }}
          name={props.name ?? ""}
          value={props.value}
          title={props.title}
          asset={props.asset.toString()}
          disabled={props.readonly ?? false}
          error={props.error}
          withoutMaxBtn
          withoutMaxValue
          onChange={(value) =>
            props.onChange ? props.onChange(value) : undefined
          }
        />
      </div>
      {props.onChange && (
        <div
          css={{ position: "absolute", top: 12, right: 12 }}
          sx={{ display: "flex", justify: "end", gap: 2 }}
        >
          <OrderAssetPctBtn
            pct={25}
            remaining={props.remaining}
            onClick={props.onChange}
          />
          <OrderAssetPctBtn
            pct={50}
            remaining={props.remaining}
            onClick={props.onChange}
          />
          <OrderAssetPctBtn
            pct={75}
            remaining={props.remaining}
            onClick={props.onChange}
          />
          <OrderAssetPctBtn
            pct={100}
            remaining={props.remaining}
            onClick={props.onChange}
          />
        </div>
      )}
    </div>
  )
}
