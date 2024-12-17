import FullSuccessIcon from "assets/icons/FullSuccessIcon.svg?react"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import { useDeposit } from "sections/deposit/DepositPage.utils"

export type DepositSuccessProps = {
  onConfirm: () => void
}

export const DepositSuccess: React.FC<DepositSuccessProps> = ({
  onConfirm,
}) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()
  const { depositedAmount, asset } = useDeposit()
  const assetDetails = asset ? getAsset(asset.assetId) : null
  return (
    <div sx={{ flex: "column", justify: "space-between", gap: 10 }}>
      <FullSuccessIcon sx={{ mx: "auto" }} />
      {assetDetails && (
        <Text tAlign="center">
          Deposited{" "}
          {t("value.tokenWithSymbol", {
            value: depositedAmount.toString(),
            symbol: assetDetails.symbol,
            fixedPointScale: assetDetails.decimals,
          })}
        </Text>
      )}
      <Button
        variant="mutedSecondary"
        size="small"
        onClick={onConfirm}
        sx={{ width: "fit-content", mx: "auto", mt: 20 }}
      >
        New deposit
      </Button>
    </div>
  )
}
