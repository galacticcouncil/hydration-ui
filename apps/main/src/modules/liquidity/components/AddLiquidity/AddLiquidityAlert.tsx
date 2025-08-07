import { Alert } from "@galacticcouncil/ui/components/Alert"
import { LinkTextButton } from "@galacticcouncil/ui/components/TextButton"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { IMPERMANENT_LOSS_LINK } from "@/config/links"

export const AddLiquidityAlert = () => {
  const { t } = useTranslation("liquidity")

  return (
    <Alert
      sx={{ my: getTokenPx("containers.paddings.primary") }}
      displayIcon={false}
      title={t("liquidity.add.modal.info.description")}
      description={
        <LinkTextButton direction="none" href={IMPERMANENT_LOSS_LINK}>
          {t("liquidity.add.modal.info.learnMoreAboutRisks")}
        </LinkTextButton>
      }
    />
  )
}
