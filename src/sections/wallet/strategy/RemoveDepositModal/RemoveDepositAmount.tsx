import BN from "bignumber.js"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useAssets } from "providers/assets"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { RemoveDepositFormValues } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal.form"

type Props = {
  readonly assetId: string
  readonly maxBalance: string
  readonly onSelectorOpen?: () => void
}

export const RemoveDepositAmount: FC<Props> = ({
  assetId,
  maxBalance,
  onSelectorOpen,
}) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const { control } = useFormContext<RemoveDepositFormValues>()
  const assetMeta = getAssetWithFallback(assetId)

  const maxBalanceBn = BN(maxBalance).shiftedBy(assetMeta.decimals)

  return (
    <Controller
      control={control}
      name="amount"
      render={({ field, fieldState }) => (
        <AssetSelect
          name={field.name}
          onChange={field.onChange}
          value={field.value}
          id={assetId}
          title={t("amount")}
          error={fieldState?.error?.message}
          balance={maxBalanceBn}
          balanceMax={maxBalanceBn}
          balanceLabel={t("lending.withdraw.balance")}
          onSelectAssetClick={onSelectorOpen}
        />
      )}
    />
  )
}
