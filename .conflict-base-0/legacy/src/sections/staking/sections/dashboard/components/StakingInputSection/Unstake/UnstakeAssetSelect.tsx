import { u32 } from "@polkadot/types"
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

  return (
    <AssetSelect
      disabled
      name={name}
      title={title}
      value={value}
      onChange={onChange}
      id={assetId.toString()}
      balance={BN_0}
      error={error}
      balanceLabel={t("staking.dashboard.form.unstake.balanceLabel")}
      withoutMaxValue
    />
  )
}
