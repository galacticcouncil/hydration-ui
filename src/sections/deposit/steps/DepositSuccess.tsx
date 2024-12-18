import { useNavigate } from "@tanstack/react-location"
import FullSuccessIcon from "assets/icons/FullSuccessIcon.svg?react"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import { StepButton } from "sections/deposit/components/StepButton"
import { useDeposit } from "sections/deposit/DepositPage.utils"
import { LINKS } from "utils/navigation"

export type DepositSuccessProps = {
  onConfirm: () => void
}

export const DepositSuccess: React.FC<DepositSuccessProps> = ({
  onConfirm,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getAsset } = useAssets()
  const { depositedAmount, asset } = useDeposit()
  const assetDetails = asset ? getAsset(asset.assetId) : null

  return (
    <div
      sx={{ flex: "column", justify: "space-between", px: [10, 30], gap: 30 }}
    >
      <div>
        <Icon
          size={48}
          sx={{ mx: "auto", mb: 16 }}
          icon={<FullSuccessIcon />}
        />
        <Text fs={19} lh={24} font="GeistMono" tAlign="center" sx={{ mb: 10 }}>
          Deposit successful!
        </Text>
        {assetDetails && (
          <Text fs={16} lh={22} color="basic400" tAlign="center">
            Congtrats, you’ve succesfully deposit your{" "}
            <Text as="span">
              {t("value.tokenWithSymbol", {
                value: depositedAmount.toString(),
                symbol: assetDetails.symbol,
                fixedPointScale: assetDetails.decimals,
              })}
            </Text>{" "}
            to Hydration. Wondering what you can do now?
          </Text>
        )}
      </div>

      <div sx={{ flex: "column", gap: 20 }}>
        <StepButton
          title="Stake HDX"
          description="Stake Your HDX and get up to XX % APR"
          onClick={() => navigate({ to: LINKS.staking })}
        />
        <StepButton
          title="Supply & borow"
          description="Supply your asset as collateral, earn APR and borrow against it"
          onClick={() => navigate({ to: LINKS.borrow })}
        />
        <StepButton
          title="Liquidity mining"
          description="Provide liquidity and get up to XX % APR"
          onClick={() => navigate({ to: LINKS.liquidity })}
        />
        <StepButton
          title="Trade, DCA & have fun"
          description="DCA on Hydration to buy other assets"
          onClick={() => navigate({ to: LINKS.trade })}
        />
      </div>
      <div sx={{ textAlign: "center" }}>
        <Button
          variant="mutedSecondary"
          onClick={() => navigate({ to: LINKS.walletAssets })}
        >
          Go back to wallet
        </Button>
      </div>
    </div>
  )
}
