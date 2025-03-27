import BigNumber from "bignumber.js"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { Modal } from "components/Modal/Modal"
import { FC, useState } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"

type Props = {
  readonly selectedAssetBalance: string
}

export const NewDepositAssetField: FC<Props> = ({ selectedAssetBalance }) => {
  const { t } = useTranslation()
  const { control, setValue } = useFormContext<NewDepositFormValues>()

  const [isAssetSelectOpen, setIsAssetSelectOpen] = useState(false)

  const { field: assetField, fieldState: assetFieldState } = useController({
    control,
    name: "asset",
  })

  const { field: amountField, fieldState: amountFieldState } = useController({
    control,
    name: "amount",
  })

  return (
    <>
      <AssetSelect
        name={amountField.name}
        value={amountField.value}
        id={assetField.value?.id ?? ""}
        error={
          assetFieldState.error?.message ?? amountFieldState.error?.message
        }
        title={t("wallet.strategy.deposit.yourDeposit")}
        onChange={amountField.onChange}
        balance={new BigNumber(selectedAssetBalance)}
        balanceLabel={t("balance")}
        onSelectAssetClick={() => setIsAssetSelectOpen(true)}
      />
      <Modal
        open={isAssetSelectOpen}
        onClose={() => setIsAssetSelectOpen(false)}
        title={t("selectAsset.title")}
        noPadding
      >
        <AssetsModalContent
          allAssets
          hideInactiveAssets
          onSelect={(asset) => {
            setValue("asset", asset, { shouldValidate: true })
            setIsAssetSelectOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
