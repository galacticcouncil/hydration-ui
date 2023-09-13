import { u32 } from "@polkadot/types"
import { useAsset } from "api/asset"
import { useTokenBalance } from "api/balances"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import BN from "bignumber.js"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Bond } from "api/bonds"
import { getBondName } from "sections/trade/sections/bonds/Bonds.utils"

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
  bond?: Bond

  error?: string
}) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const asset = useAsset(props.bond ? props.bond.assetId : props.asset)
  const balance = useTokenBalance(props.asset, account?.address)

  let name = asset.data?.name
  let symbol = asset.data?.symbol

  if (props.bond) {
    name = getBondName(
      asset.data?.symbol ?? "",
      new Date(props.bond.maturity),
      true,
    )
    symbol = `${asset.data?.symbol}b`
  }

  return (
    <AssetSelect
      name={props.name}
      title={props.title}
      className={props.className}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      asset={props.asset}
      assetIcon={<AssetLogo id={asset.data?.id} />}
      decimals={asset.data?.decimals?.toNumber()}
      balance={props.balance ?? balance.data?.balance}
      assetName={name}
      assetSymbol={symbol}
      onSelectAssetClick={props.onAssetOpen}
      error={props.error}
      balanceLabel={t("selectAsset.balance.label")}
      bond={props.bond}
    />
  )
}
