import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"
import { useMount } from "react-use"

import { CexAssetSelect } from "@/modules/onramp/components/CexAssetSelect/CexAssetSelect"
import { CEX_CONFIG } from "@/modules/onramp/config/cex"
import { useDepositStore } from "@/modules/onramp/store/useDepositStore"
import { AssetConfig } from "@/modules/onramp/types"

export type DepositCexSelectProps = {
  onAssetSelect: (asset: AssetConfig) => void
  onBack: () => void
}

export const DepositCexSelect: React.FC<DepositCexSelectProps> = ({
  onAssetSelect,
  onBack,
}) => {
  const { t } = useTranslation(["onramp"])
  const { setCexId, cexId, setCurrentDeposit } = useDepositStore()

  useMount(() => setCurrentDeposit(null))

  const cex = CEX_CONFIG.find(({ id }) => id === cexId)

  if (!cex) return null

  return (
    <>
      <ModalHeader
        title={t("deposit.cex.select.title")}
        align="center"
        onBack={onBack}
        closable={false}
      />
      <ModalBody noPadding>
        <CexAssetSelect
          activeCexId={cexId}
          onCexSelect={setCexId}
          onAssetSelect={onAssetSelect}
        />
      </ModalBody>
    </>
  )
}
