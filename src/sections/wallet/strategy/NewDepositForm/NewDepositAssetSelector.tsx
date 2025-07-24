import { FC } from "react"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { useFormContext } from "react-hook-form"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"

type Props = {
  readonly allowedAssets: Array<string>
  readonly onClose: () => void
}

export const NewDepositAssetSelector: FC<Props> = ({
  allowedAssets,
  onClose,
}) => {
  const { setValue, getValues } = useFormContext<NewDepositFormValues>()

  return (
    <AssetsModalContent
      allowedAssets={allowedAssets}
      defaultSelectedAsssetId={getValues("asset")?.id}
      naturallySorted
      hideInactiveAssets
      displayZeroBalance
      onSelect={(asset) => {
        setValue("asset", asset, { shouldValidate: true })
        onClose()
      }}
    />
  )
}
