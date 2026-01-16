import {
  BriefcaseIcon,
  CreditCardIcon,
  LinkIcon,
} from "@galacticcouncil/ui/assets/icons"
import { ModalBody, ModalHeader, Stack } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { StepButton } from "@/modules/onramp/components/StepButton"
import { OnrampScreen } from "@/modules/onramp/types"

type WithdrawMethodSelectProps = {
  onSelect: (method: OnrampScreen) => void
}

export const WithdrawMethodSelect: React.FC<WithdrawMethodSelectProps> = ({
  onSelect,
}) => {
  const { t } = useTranslation(["onramp"])
  const navigate = useNavigate()

  return (
    <>
      <ModalHeader
        title={t("withdraw.method.title")}
        closable={false}
        align="center"
      />
      <ModalBody>
        <Stack gap={getTokenPx("scales.paddings.m")}>
          <StepButton
            icon={BriefcaseIcon}
            onClick={() => onSelect(OnrampScreen.WithdrawAssetSelect)}
            title={t("withdraw.method.cex.title")}
            description={t("withdraw.method.cex.description")}
          />
          <StepButton
            icon={LinkIcon}
            onClick={() => navigate({ to: "/cross-chain" })}
            title={t("withdraw.method.onchain.title")}
            description={t("withdraw.method.onchain.description")}
          />
          <StepButton
            icon={CreditCardIcon}
            onClick={() => onSelect(OnrampScreen.WithdrawBank)}
            title={t("withdraw.method.bank.title")}
            description={t("withdraw.method.bank.description")}
          />
        </Stack>
      </ModalBody>
    </>
  )
}
