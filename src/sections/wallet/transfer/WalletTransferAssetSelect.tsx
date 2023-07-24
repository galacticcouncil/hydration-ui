import { u32 } from "@polkadot/types"
import { useAsset } from "api/asset"
import { useTokenBalance, useTokenLocks } from "api/balances"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { BN_0 } from "utils/constants"

export const WalletTransferAssetSelect = (props: {
  name: string

  value: string
  onBlur?: (value: string) => void
  onChange: (value: string) => void

  asset: u32 | string

  onAssetOpen?: () => void
  title?: string
  className?: string

  error?: string
}) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const asset = useAsset(props.asset)
  const balance = useTokenBalance(props.asset, account?.address)
  const locks = useTokenLocks(props.asset)

  const vestLocks = locks.data?.reduce(
    (acc, lock) => (lock.type === "ormlvest" ? acc.plus(lock.amount) : acc),
    BN_0,
  )

  const availableBalance = balance.data?.balance.minus(vestLocks ?? 0)

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
      balance={availableBalance}
      assetName={asset.data?.name?.toString()}
      assetSymbol={asset.data?.symbol?.toString()}
      onSelectAssetClick={props.onAssetOpen}
      error={props.error}
      balanceLabel={t("selectAsset.balance.label")}
    />
  )
}
