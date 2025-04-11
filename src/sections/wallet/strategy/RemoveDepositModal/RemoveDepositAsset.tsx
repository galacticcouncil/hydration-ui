import { AssetSelectButton } from "components/AssetSelect/AssetSelectButton"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  SAssetContainer,
  SAssetLabel,
  SContainer,
} from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositAsset.styled"
import { RemoveDepositFormValues } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal.form"

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
      render={({ field }) => (
        <SContainer>
          <SAssetLabel color="brightBlue300">
            {t("wallet.strategy.remove.assetToReceive")}
          </SAssetLabel>
          <SAssetContainer>
            <AssetSelectButton
              assetId={field.value?.id ?? ""}
              onClick={onSelectorOpen}
            />
            <Text fs={[16, 20]} lh={26} fw={[500, 700]}>
              {amountOut}
            </Text>
          </SAssetContainer>
        </SContainer>
      )}
    />
  )
}
