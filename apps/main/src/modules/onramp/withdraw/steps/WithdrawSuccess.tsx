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

import { getCexConfigById } from "@/modules/onramp/config/cex"
import { useDeposit } from "@/modules/onramp/deposit/hooks/useDeposit"
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

  const cex = getCexConfigById(cexId)

  return (
    <ModalBody>
      <Stack gap="s">
        <Icon
          size="2xl"
          component={CircleCheck}
          color={getToken("accents.success.emphasis")}
          sx={{ mx: "auto", my: 10 }}
        />
        <Text fs="p2" lh={1.3} fw={600} align="center">
          {t("withdraw.success.title")}
        </Text>
        {assetDetails && (
          <Text fs="p3" lh={1.4} color={getToken("text.low")} align="center">
            <Trans
              t={t}
              i18nKey="withdraw.success.description"
              values={{
                amount,
                symbol: assetDetails.symbol,
                cex: cex?.title,
              }}
            >
              <span sx={{ color: getToken("text.high") }} />
            </Trans>
          </Text>
        )}
      </Stack>

      <Stack gap="m" mt="xl">
        <Button onClick={onConfirm} size="large">
          {t("withdraw.success.cta.withdrawtMore")}
        </Button>
      </Stack>
    </ModalBody>
  )
}
