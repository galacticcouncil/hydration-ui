import { u32 } from "@polkadot/types"
import { useTokenBalance } from "api/balances"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import BN from "bignumber.js"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Bond } from "api/bonds"
import { getBondName } from "sections/trade/sections/bonds/Bonds.utils"
import { useRpcProvider } from "providers/rpcProvider"

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
  withoutMaxBtn?: boolean

  error?: string
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()
  const asset = assets.getAsset(props.asset.toString())
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
      assetIcon={<AssetLogo id={asset.id} />}
      decimals={asset.decimals}
      balance={props.balance ?? balance.data?.balance}
      assetName={asset.name}
      assetSymbol={asset.symbol}
      onSelectAssetClick={props.onAssetOpen}
      error={props.error}
      balanceLabel={t("selectAsset.balance.label")}
      withoutMaxBtn={props.withoutMaxBtn}
      bond={props.bond}
    />
  )
}
