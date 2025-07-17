import { u32 } from "@polkadot/types"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useTranslation } from "react-i18next"
import BN from "bignumber.js"
import { useAccountBalances } from "api/deposits"

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
  balanceMax?: BN
  withoutMaxBtn?: boolean
  withoutMaxValue?: boolean
  disabled?: boolean

  error?: string
}) => {
  const { t } = useTranslation()
  const accountAssets = useAccountBalances()
  const balance = accountAssets.data?.accountAssetsMap.get(
    props.asset.toString(),
  )?.balance?.transferable

  return (
    <AssetSelect
      name={props.name}
      title={props.title}
      className={props.className}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      id={props.asset.toString()}
      balance={props.balance ?? BN(balance ?? "0")}
      balanceMax={props.balanceMax}
      onSelectAssetClick={props.onAssetOpen}
      error={props.error}
      balanceLabel={t("selectAsset.balance.label")}
      withoutMaxBtn={props.withoutMaxBtn}
      withoutMaxValue={props.withoutMaxValue}
      disabled={props.disabled}
    />
  )
}
