import { CircleCheck } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Icon,
  ModalBody,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Trans, useTranslation } from "react-i18next"

import { CEX_CONFIG } from "@/modules/onramp/config/cex"
import { useDeposit } from "@/modules/onramp/hooks/useDeposit"
import { useAssets } from "@/providers/assetsProvider"

export type WithdrawSuccessProps = {
  onConfirm: () => void
}

export const WithdrawSuccess: React.FC<WithdrawSuccessProps> = ({
  onConfirm,
}) => {
  const { t } = useTranslation(["onramp"])
  const { getAsset } = useAssets()
  const { asset, amount, cexId } = useDeposit()
  const assetDetails = asset ? getAsset(asset.assetId) : null

  const cex = CEX_CONFIG.find(({ id }) => id === cexId)

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
          {t("withdraw.success.title")}
        </Text>
        {assetDetails && (
          <Text fs={14} lh={1.4} color={getToken("text.low")} align="center">
            <Trans
              t={t}
              i18nKey="withdraw.success.description"
              values={{
                value: amount,
                symbol: assetDetails.symbol,
                cex: cex?.title,
              }}
            >
              <span sx={{ color: getToken("text.high") }} />
            </Trans>
          </Text>
        )}
      </Stack>

      <Stack gap={12} mt={20}>
        <Button onClick={onConfirm} size="large">
          {t("withdraw.success.cta.withdrawtMore")}
        </Button>
      </Stack>
    </ModalBody>
  )
}
