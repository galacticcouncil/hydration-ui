import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DepositType } from "@/modules/wallet/assets/Deposit/DepositType"

type Props = {
  readonly onCentralizedClick: () => void
  readonly onOnChainClick: () => void
  readonly onCryptoClick: () => void
}

export const DepositModal: FC<Props> = ({
  onCentralizedClick,
  onOnChainClick,
  onCryptoClick,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <>
      <ModalHeader title={t("common:deposit")} align="center" />
      <ModalBody style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <DepositType
          title={t("deposit.section.centralized.title")}
          description={t("deposit.section.centralized.description")}
          onClick={onCentralizedClick}
        />
        <DepositType
          title={t("deposit.section.onChain.title")}
          description={t("deposit.section.onChain.description")}
          onClick={onOnChainClick}
        />
        <DepositType
          title={t("deposit.section.crypto.title")}
          description={t("deposit.section.crypto.description")}
          onClick={onCryptoClick}
        />
      </ModalBody>
    </>
  )
}
