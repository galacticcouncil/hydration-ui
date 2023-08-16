import { u32 } from "@polkadot/types"
import { useAsset } from "api/asset"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useTranslation } from "react-i18next"
import { BN_0 } from "utils/constants"

export const UnstakeAssetSelect = ({
  title,
  name,
  assetId,
  value,
  onChange,
  error,
}: {
  title: string
  name: string
  onChange: (value: string) => void
  assetId: u32 | string
  error?: string
  value: string
}) => {
  const { t } = useTranslation()
  const asset = useAsset(assetId)
  const balance = BN_0 //TODO: Implement staked value

  return (
    <AssetSelect
      disabled
      name={name}
      title={title}
      value={value}
      onChange={onChange}
      asset={assetId}
      decimals={asset.data?.decimals?.toNumber()}
      balance={balance}
      assetName={asset.data?.name?.toString()}
      assetSymbol={asset.data?.symbol?.toString()}
      error={error}
      balanceLabel={t("staking.dashboard.form.unstake.balanceLabel")}
      withoutMaxValue
    />
  )
}
