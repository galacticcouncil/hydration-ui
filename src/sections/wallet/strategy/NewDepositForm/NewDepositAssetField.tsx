import BigNumber from "bignumber.js"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { FC } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"

type Props = {
  readonly selectedAssetBalance: string
  readonly onSelectAssetClick: () => void
}

export const NewDepositAssetField: FC<Props> = ({
  selectedAssetBalance,
  onSelectAssetClick,
}) => {
  const { t } = useTranslation()
  const { control } = useFormContext<NewDepositFormValues>()

  const { field: assetField, fieldState: assetFieldState } = useController({
    control,
    name: "asset",
  })

  const { field: amountField, fieldState: amountFieldState } = useController({
    control,
    name: "amount",
  })

  return (
    <AssetSelect
      name={amountField.name}
      value={amountField.value}
      id={assetField.value?.id ?? ""}
      error={assetFieldState.error?.message ?? amountFieldState.error?.message}
      title={t("wallet.strategy.deposit.depositAsset")}
      onChange={amountField.onChange}
      balance={new BigNumber(selectedAssetBalance)}
      balanceLabel={t("balance")}
      onSelectAssetClick={onSelectAssetClick}
    />
  )
}
