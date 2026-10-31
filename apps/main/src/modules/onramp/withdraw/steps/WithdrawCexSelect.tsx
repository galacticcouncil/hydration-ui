import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { CexAssetSelect } from "@/modules/onramp/components/CexAssetSelect/CexAssetSelect"
import { CexAssetSelectMobileStep } from "@/modules/onramp/components/CexAssetSelect/CexAssetSelect.utils"
import { getCexConfigById } from "@/modules/onramp/config/cex"
import { AssetConfig } from "@/modules/onramp/types"
import { useWithdraw } from "@/modules/onramp/withdraw/hooks/useWithdraw"

export type WithdrawCexSelectProps = {
  onAssetSelect: (asset: AssetConfig) => void
  onBack: () => void
  closable?: boolean
}

export const WithdrawCexSelect: React.FC<WithdrawCexSelectProps> = ({
  onAssetSelect,
  onBack,
  closable = false,
}) => {
  const { t } = useTranslation(["onramp"])
  const { gte } = useBreakpoints()
  const { setCexId, cexId, asset } = useWithdraw()
  const [mobileStep, setMobileStep] = useState<CexAssetSelectMobileStep>(
    asset ? "assets" : "exchanges",
  )
  const isMobileAssets = !gte("sm") && mobileStep === "assets"

  const cex = getCexConfigById(cexId)

  if (!cex) return null

  return (
    <>
      <ModalHeader
        title={t(isMobileAssets ? "selectAsset" : "withdraw.cex.select.title")}
        align="center"
        onBack={isMobileAssets ? () => setMobileStep("exchanges") : onBack}
        closable={closable}
      />
      <ModalBody
        noPadding
        scrollable={gte("sm")}
        display={!gte("sm") ? "flex" : undefined}
        overflow={!gte("sm") ? "hidden" : undefined}
        sx={
          !gte("sm")
            ? {
                flexDirection: "column",
                minHeight: 0,
              }
            : undefined
        }
      >
        <CexAssetSelect
          initialChainKey={asset?.withdrawalChain}
          mobileStep={mobileStep}
          onMobileStepChange={setMobileStep}
          activeCexId={cexId}
          direction="withdraw"
          searchable
          onCexSelect={setCexId}
          onAssetSelect={onAssetSelect}
        />
      </ModalBody>
    </>
  )
}
