import { u32 } from "@polkadot/types"
import { useTokenBalance } from "api/balances"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import BN from "bignumber.js"

export const WalletTransferAssetSelect = (props: {
  name: string

  value: string
  onBlur?: (value: string) => void
  onChange: (value: string) => void

  asset: u32 | string

  onAssetOpen?: () => void
  title?: string
  className?: string
  balance?: BN
  withoutMaxBtn?: boolean

  error?: string
}) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const balance = useTokenBalance(props.asset, account?.address)

  return (
    <AssetSelect
      name={props.name}
      title={props.title}
      className={props.className}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      id={props.asset.toString()}
      balance={props.balance ?? balance.data?.balance}
      onSelectAssetClick={props.onAssetOpen}
      error={props.error}
      balanceLabel={t("selectAsset.balance.label")}
      withoutMaxBtn={props.withoutMaxBtn}
    />
  )
}
