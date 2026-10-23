import {
  ArrowRightLeftIcon,
  LandmarkIcon,
} from "@galacticcouncil/ui/assets/icons"
import { ModalBody, Stack } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { StepButton } from "@/modules/onramp/components/StepButton"
import { OnrampScreen } from "@/modules/onramp/types"

type WithdrawMethodSelectProps = {
  onSelect: (method: OnrampScreen) => void
  onOnchain: () => void
  onBank: () => void
}

export const WithdrawMethodSelect: FC<WithdrawMethodSelectProps> = ({
  onSelect,
  onOnchain,
  onBank,
}) => {
  const { t } = useTranslation("onramp")
  return (
    <>
      <SOnrampStepHeader title={t("withdraw.method.title")} align="center" />
      <ModalBody>
        <Stack gap="m">
          <StepButton
            icon={LandmarkIcon}
            onClick={() => onSelect(OnrampScreen.WithdrawAssetSelect)}
            title={t("withdraw.method.cex.title")}
            description={t("withdraw.method.cex.description")}
          />
          <StepButton
            icon={ArrowRightLeftIcon}
            onClick={onOnchain}
            title={t("withdraw.method.onchain.title")}
            description={t("withdraw.method.onchain.description")}
          />
          <StepButton
            icon={LandmarkIcon}
            onClick={onBank}
            title={t("withdraw.method.bank.title")}
            description={t("withdraw.method.bank.previewDescription")}
          />
        </Stack>
      </ModalBody>
    </>
  )
}
