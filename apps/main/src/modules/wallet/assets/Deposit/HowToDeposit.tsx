import { ErrorMessageBar } from "@galacticcouncil/ui/components"
import {
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components/Modal"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DepositInfo } from "@/modules/wallet/assets/Deposit/DepositInfo"
import { HowToDepositQnA } from "@/modules/wallet/assets/Deposit/HowToDepositQnA"

type Props = {
  readonly onBack: () => void
}

export const HowToDepositModal: FC<Props> = ({ onBack }) => {
  const { t } = useTranslation("wallet")

  return (
    <>
      <ModalHeader
        title={t("deposit.howTo.title")}
        align="center"
        onBack={onBack}
      />
      <ModalBody>
        <DepositInfo />
        <ModalContentDivider />
        <HowToDepositQnA />
      </ModalBody>
      <ModalFooter>
        <ErrorMessageBar description={t("deposit.howTo.infoMessage")} />
      </ModalFooter>
    </>
  )
}
