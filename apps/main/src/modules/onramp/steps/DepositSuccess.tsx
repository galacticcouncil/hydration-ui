import { CircleCheck } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Icon,
  ModalBody,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useNavigate } from "@tanstack/react-router"
import { Trans, useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { StepButton } from "@/modules/onramp/components/StepButton"
import { useDeposit } from "@/modules/onramp/hooks/useDeposit"
import { useAssets } from "@/providers/assetsProvider"
import { toBig } from "@/utils/formatting"

export type DepositSuccessProps = {
  onConfirm: () => void
}

export const DepositSuccess: React.FC<DepositSuccessProps> = ({
  onConfirm,
}) => {
  const { t } = useTranslation(["onramp"])
  const navigate = useNavigate()
  const { getAsset } = useAssets()
  const { amount, asset } = useDeposit()

  const assetDetails = asset?.assetId ? getAsset(asset.assetId) : null

  return (
    <ModalBody gap={30}>
      <Stack gap={6}>
        <Icon
          size={48}
          component={CircleCheck}
          color={getToken("accents.success.emphasis")}
          sx={{ mx: "auto", my: 10 }}
        />
        <Text fs={18} lh={1.3} fw={600} align="center">
          {t("deposit.success.title")}
        </Text>
        {assetDetails && (
          <Text fs={14} lh={1.4} color={getToken("text.low")} align="center">
            <Trans
              t={t}
              i18nKey="onramp.success.description"
              values={{
                value: toBig(amount, assetDetails.decimals).toString(),
                symbol: assetDetails.symbol,
              }}
            >
              <span sx={{ color: getToken("text.high") }} />
            </Trans>
          </Text>
        )}
      </Stack>
      <Stack gap={12} mt={20}>
        <StepButton
          title={t("deposit.success.cta.staking.title")}
          description={t("deposit.success.cta.staking.description")}
          onClick={() => navigate({ to: LINKS.staking })}
        />
        <StepButton
          title={t("deposit.success.cta.borrow.title")}
          description={t("deposit.success.cta.borrow.description")}
          onClick={() => navigate({ to: LINKS.borrow })}
        />
        <StepButton
          title={t("deposit.success.cta.liquidity.title")}
          description={t("deposit.success.cta.liquidity.description")}
          onClick={() => navigate({ to: LINKS.liquidity })}
        />
        <StepButton
          title={t("deposit.success.cta.trade.title")}
          description={t("deposit.success.cta.trade.description")}
          onClick={() => navigate({ to: LINKS.swap })}
        />
        <StepButton
          title={t("deposit.success.cta.wallet.title")}
          description={t("deposit.success.cta.wallet.description")}
          onClick={() => navigate({ to: LINKS.walletAssets })}
        />

        <Button onClick={onConfirm} size="large">
          {t("deposit.success.cta.depositMore")}
        </Button>
      </Stack>
    </ModalBody>
  )
}
