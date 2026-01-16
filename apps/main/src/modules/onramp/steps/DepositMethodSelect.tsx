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

export type DepositMethodSelectProps = {
  onSelect: (page: OnrampScreen) => void
}

export const DepositMethodSelect: React.FC<DepositMethodSelectProps> = ({
  onSelect,
}) => {
  const { t } = useTranslation(["onramp"])
  const navigate = useNavigate()

  return (
    <>
      <ModalHeader
        title={t("deposit.method.title")}
        closable={false}
        align="center"
      />
      <ModalBody>
        <Stack gap={getTokenPx("scales.paddings.m")}>
          <StepButton
            icon={BriefcaseIcon}
            onClick={() => onSelect(OnrampScreen.DepositAssetSelect)}
            title={t("deposit.method.cex.title")}
            description={t("deposit.method.cex.description")}
          />
          <StepButton
            icon={LinkIcon}
            onClick={() => navigate({ to: "/cross-chain" })}
            title={t("deposit.method.onchain.title")}
            description={t("deposit.method.onchain.description")}
          />
          <StepButton
            icon={CreditCardIcon}
            onClick={() => onSelect(OnrampScreen.DepositBank)}
            title={t("deposit.method.bank.title")}
            description={t("deposit.method.bank.description")}
          />
        </Stack>
      </ModalBody>
    </>
  )
}
