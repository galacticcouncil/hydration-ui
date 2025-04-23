import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DepositType } from "@/modules/wallet/assets/Deposit/DepositType"

type Props = {
  readonly onCentralizedClick: () => void
  readonly onOnChainClick: () => void
}

export const WithdrawModal: FC<Props> = ({
  onCentralizedClick,
  onOnChainClick,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <>
      <ModalHeader title={t("common:withdraw")} align="center" />
      <ModalBody style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <DepositType
          title={t("withdraw.section.centralized.title")}
          description={t("withdraw.section.centralized.description")}
          onClick={onCentralizedClick}
        />
        <DepositType
          title={t("withdraw.section.onChain.title")}
          description={t("withdraw.section.onChain.description")}
          onClick={onOnChainClick}
        />
      </ModalBody>
    </>
  )
}
