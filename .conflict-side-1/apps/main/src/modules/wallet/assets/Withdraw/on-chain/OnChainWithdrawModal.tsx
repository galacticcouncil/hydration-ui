import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { ChainAssets } from "@/modules/wallet/assets/Withdraw/on-chain/ChainAssets"
import { ChainMenu } from "@/modules/wallet/assets/Withdraw/on-chain/ChainMenu"

type Props = {
  readonly onBack: () => void
  readonly onSelect: () => void
}

export const OnChainWithdrawModal: FC<Props> = ({ onBack, onSelect }) => {
  const { t } = useTranslation("wallet")

  return (
    <>
      <ModalHeader
        title={t("withdraw.onChain.title")}
        align="center"
        onBack={onBack}
      />
      <ModalBody
        sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20 }}
      >
        <ChainMenu />
        <ChainAssets onSelect={onSelect} />
      </ModalBody>
    </>
  )
}
