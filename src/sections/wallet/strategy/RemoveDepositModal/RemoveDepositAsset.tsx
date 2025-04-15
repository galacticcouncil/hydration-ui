import { AssetSelectButton } from "components/AssetSelect/AssetSelectButton"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
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
import { useAssetsPrice } from "state/displayPrice"
import BN from "bignumber.js"

type Props = {
  readonly assetId: string
  readonly amountOut: string
  readonly onSelectorOpen: () => void
}

export const RemoveDepositAsset: FC<Props> = ({
  assetId,
  amountOut,
  onSelectorOpen,
}) => {
  const { t } = useTranslation()
  const { control } = useFormContext<RemoveDepositFormValues>()

  const { getAssetPrice } = useAssetsPrice([assetId])
  const spotPrice = getAssetPrice(assetId).price || "0"
  const amountOutDisplay = new BN(spotPrice).times(amountOut || "0")

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
            <div sx={{ flex: "column", align: "flex-end" }}>
              <Text fs={[16, 18]} fw={[500, 700]}>
                {t("value.token", { value: amountOut })}
              </Text>
              <Text color="basic400" fs={11}>
                <DisplayValue value={amountOutDisplay} />
              </Text>
            </div>
          </SAssetContainer>
        </SContainer>
      )}
    />
  )
}
