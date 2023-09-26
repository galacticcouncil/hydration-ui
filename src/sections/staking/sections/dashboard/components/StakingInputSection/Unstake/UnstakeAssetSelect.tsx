import { u32 } from "@polkadot/types"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useTranslation } from "react-i18next"
import { BN_0 } from "utils/constants"
import { useRpcProvider } from "providers/rpcProvider"

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
  const {
    assets: { native },
  } = useRpcProvider()

  return (
    <AssetSelect
      disabled
      name={name}
      title={title}
      value={value}
      onChange={onChange}
      asset={assetId}
      decimals={native.decimals}
      balance={BN_0}
      assetName={native.name}
      assetSymbol={native.symbol}
      error={error}
      balanceLabel={t("staking.dashboard.form.unstake.balanceLabel")}
      withoutMaxValue
    />
  )
}
