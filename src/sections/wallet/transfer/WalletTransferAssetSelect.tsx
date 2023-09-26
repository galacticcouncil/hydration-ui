import { useTokenBalance } from "api/balances"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"

export const WalletTransferAssetSelect = (props: {
  name: string

  value: string
  onBlur?: (value: string) => void
  onChange: (value: string) => void

  asset?: string

  onAssetOpen?: () => void
  title?: string
  className?: string
  balance?: BN
  withoutMaxBtn?: boolean

  error?: string
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()
  const asset = props?.asset ? assets.getAsset(props?.asset) : undefined
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
      decimals={asset?.decimals}
      balance={props.balance ?? balance.data?.balance}
      assetName={asset?.name}
      assetSymbol={asset?.symbol}
      onSelectAssetClick={props.onAssetOpen}
      error={props.error}
      balanceLabel={t("selectAsset.balance.label")}
      withoutMaxBtn={props.withoutMaxBtn}
    />
  )
}
