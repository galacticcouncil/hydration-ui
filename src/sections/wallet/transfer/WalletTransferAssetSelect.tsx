import { u32 } from "@polkadot/types"
import { useAsset } from "api/asset"
import { useTokenBalance } from "api/balances"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useAccountStore } from "state/store"

export const WalletTransferAssetSelect = (props: {
  name: string

  value: string
  onBlur?: (value: string) => void
  onChange: (value: string) => void

  asset: u32 | string

  onAssetOpen: () => void
  title?: string
  className?: string

  error?: string
}) => {
  const { account } = useAccountStore()
  const asset = useAsset(props.asset)
  const balance = useTokenBalance(props.asset, account?.address)

  return (
    <AssetSelect
      name={props.name}
      title={props.title}
      className={props.className}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      asset={props.asset}
      assetIcon={asset.data?.icon}
      decimals={asset.data?.decimals?.toNumber()}
      balance={balance.data?.balance}
      assetName={asset.data?.name?.toString()}
      assetSymbol={asset.data?.symbol?.toString()}
      onSelectAssetClick={props.onAssetOpen}
      error={props.error}
    />
  )
}
