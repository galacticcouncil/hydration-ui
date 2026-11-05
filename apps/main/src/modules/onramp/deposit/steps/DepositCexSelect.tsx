import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMount } from "react-use"

import { CexAssetSelect } from "@/modules/onramp/components/CexAssetSelect/CexAssetSelect"
import { CexAssetSelectMobileStep } from "@/modules/onramp/components/CexAssetSelect/CexAssetSelect.utils"
import { getCexConfigById } from "@/modules/onramp/config/cex"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
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
  const { gte } = useBreakpoints()
  const { setCexId, cexId, asset, setCurrentDeposit } = useOnrampStore()
  const [mobileStep, setMobileStep] = useState<CexAssetSelectMobileStep>(
    asset ? "assets" : "exchanges",
  )
  const isMobileAssets = !gte("sm") && mobileStep === "assets"

  useMount(() => setCurrentDeposit(null))

  const cex = getCexConfigById(cexId)

  if (!cex) return null

  return (
    <>
      <ModalHeader
        title={t(isMobileAssets ? "selectAsset" : "deposit.cex.select.title")}
        align="center"
        onBack={isMobileAssets ? () => setMobileStep("exchanges") : onBack}
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
          initialChainKey={asset?.depositChain}
          mobileStep={mobileStep}
          onMobileStepChange={setMobileStep}
          searchable
          activeCexId={cexId}
          onCexSelect={setCexId}
          onAssetSelect={onAssetSelect}
        />
      </ModalBody>
    </>
  )
}
