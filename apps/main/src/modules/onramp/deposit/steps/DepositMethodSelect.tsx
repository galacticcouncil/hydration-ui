import {
  ArrowRightLeftIcon,
  LandmarkIcon,
} from "@galacticcouncil/ui/assets/icons"
import { ModalBody, ModalHeader, Stack } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { StepButton } from "@/modules/onramp/components/StepButton"
import { PendingDeposits } from "@/modules/onramp/deposit/components/PendingDeposits"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { OnrampScreen } from "@/modules/onramp/types"

export type DepositMethodSelectProps = {
  onSelect: (page: OnrampScreen) => void
}

export const DepositMethodSelect: React.FC<DepositMethodSelectProps> = ({
  onSelect,
}) => {
  const { t } = useTranslation(["onramp"])
  const setModal = useOnrampModal((state) => state.setModal)

  return (
    <>
      <ModalHeader title={t("deposit.method.title")} align="center" />
      <ModalBody>
        <Stack gap="m">
          <StepButton
            icon={LandmarkIcon}
            onClick={() => onSelect(OnrampScreen.DepositAssetSelect)}
            title={t("deposit.method.cex.title")}
            description={t("deposit.method.cex.description")}
          />
          <StepButton
            icon={ArrowRightLeftIcon}
            onClick={() => onSelect(OnrampScreen.DepositOnchainWallet)}
            title={t("deposit.method.onchain.title")}
            description={t("deposit.method.onchain.description")}
          />
          <StepButton
            icon={LandmarkIcon}
            onClick={() => setModal("bankDeposit")}
            title={t("deposit.method.bridge.title")}
            description={t("deposit.method.bridge.description")}
          />
        </Stack>
      </ModalBody>
      <PendingDeposits />
    </>
  )
}
