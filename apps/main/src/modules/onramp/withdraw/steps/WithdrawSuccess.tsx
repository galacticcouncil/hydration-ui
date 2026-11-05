import SuccessStatus from "@galacticcouncil/ui/assets/images/SuccessStatus.webp"
import {
  Button,
  Image,
  ModalBody,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Trans, useTranslation } from "react-i18next"

import { useWithdraw } from "@/modules/onramp/withdraw/hooks/useWithdraw"
import { useAssets } from "@/providers/assetsProvider"

export type WithdrawSuccessProps = {
  onConfirm: () => void
  showTitle?: boolean
}

export const WithdrawSuccess: React.FC<WithdrawSuccessProps> = ({
  onConfirm,
  showTitle = true,
}) => {
  const { t } = useTranslation(["onramp"])
  const { getAsset } = useAssets()
  const { asset, amount, cexId } = useWithdraw()
  const assetDetails = asset ? getAsset(asset.assetId) : null

  return (
    <ModalBody>
      <Stack gap="s">
        <Image
          src={SuccessStatus}
          alt=""
          aria-hidden
          lazy={false}
          sx={{ size: "3xl", objectFit: "contain", mx: "auto", my: "m" }}
        />
        {showTitle && (
          <Text fs="p2" lh={1.3} fw={600} align="center">
            {t("withdraw.success.title")}
          </Text>
        )}
        {assetDetails && (
          <Text fs="p3" lh={1.4} color={getToken("text.low")} align="center">
            <Trans
              t={t}
              i18nKey="withdraw.success.description"
              values={{
                amount,
                symbol: assetDetails.symbol,
                cex: t(`cex.${cexId}.title`),
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
