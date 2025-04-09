import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { Controller, useFormContext } from "react-hook-form"
import { RemoveDepositFormValues } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal.form"
import { BigNumber } from "bignumber.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly amountOut: string
  readonly onSelectorOpen: () => void
}

export const RemoveDepositAsset: FC<Props> = ({
  amountOut,
  onSelectorOpen,
}) => {
  const { t } = useTranslation()
  const { control } = useFormContext<RemoveDepositFormValues>()

  return (
    <Controller
      control={control}
      name="assetReceived"
      render={({ field, fieldState }) => (
        <AssetSelect
          name={field.name}
          id={field.value?.id ?? ""}
          value={amountOut}
          title={field.value?.symbol}
          balance={new BigNumber(0)}
          balanceLabel={t("balance")}
          onChange={() => {}}
          error={fieldState.error?.message}
          onSelectAssetClick={onSelectorOpen}
          disabled
          withoutMaxValue
        />
      )}
    />
  )
}
