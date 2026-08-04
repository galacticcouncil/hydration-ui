import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"
import { useMount } from "react-use"

import { CexAssetSelect } from "@/modules/onramp/components/CexAssetSelect/CexAssetSelect"
import { getCexConfigById } from "@/modules/onramp/config/cex"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { AssetConfig } from "@/modules/onramp/types"

export type WithdrawCexSelectProps = {
  onAssetSelect: (asset: AssetConfig) => void
  onBack: () => void
}

export const WithdrawCexSelect: React.FC<WithdrawCexSelectProps> = ({
  onAssetSelect,
  onBack,
}) => {
  const { t } = useTranslation(["onramp"])
  const { setCexId, cexId, setCurrentDeposit } = useOnrampStore()

  useMount(() => setCurrentDeposit(null))

  const cex = getCexConfigById(cexId)

  if (!cex) return null

  return (
    <>
      <ModalHeader
        title={t("withdraw.cex.select.title")}
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
