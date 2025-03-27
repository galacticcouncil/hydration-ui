import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { Controller, useFormContext } from "react-hook-form"
import { RemoveDepositFormValues } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal.form"
import { BigNumber } from "bignumber.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { useBestTrade } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.api"

type Props = {
  readonly assetId: string
  readonly balance: string
  readonly amountOut: string
  readonly onSelectorOpen: () => void
}

export const RemoveDepositAsset: FC<Props> = ({
  assetId,
  balance,
  amountOut,
  onSelectorOpen,
}) => {
  const { t } = useTranslation()
  const { control, watch } = useFormContext<RemoveDepositFormValues>()

  const assetReceived = watch("assetReceived")

  const [, , maxAssetReceived] = useBestTrade(
    assetId,
    assetReceived?.id ?? "",
    balance,
  )

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
          balance={new BigNumber(maxAssetReceived)}
          balanceLabel={t("balance")}
          onChange={() => {}}
          error={fieldState.error?.message}
          onSelectAssetClick={onSelectorOpen}
        />
      )}
    />
  )
}
