import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { OnrampVariantLayout } from "@/modules/onramp/components/OnrampVariantLayout"
import {
  DepositFlow,
  useOnrampModal,
} from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"

type DepositFlowLayoutProps = {
  flow: DepositFlow
  children: ReactNode
}

export const DepositFlowLayout: FC<DepositFlowLayoutProps> = ({
  flow,
  children,
}) => {
  const { t } = useTranslation("onramp")
  const setEntryFlow = useOnrampModal((state) => state.setDepositEntryFlow)
  const entryFlow = useOnrampModal((state) => state.depositEntryFlow)
  const entryChoice = useOnrampModal((state) => state.depositEntryChoice)
  const modal = useOnrampModal((state) => state.modal)
  const page = useOnrampStore((state) => state.page)
  const assetsLayout = useOnrampModal((state) => state.depositAssetsLayout)
  const showAssetsAlternative = flow === "connected" && modal !== "deposit"
  const selectedFlow =
    modal === "deposit" ? entryFlow : entryChoice ? "choice" : flow
  return (
    <OnrampVariantLayout
      value={showAssetsAlternative ? assetsLayout : selectedFlow}
      showSwitcher={showAssetsAlternative}
      desktopMinHeight={
        modal !== "deposit" &&
        page !== OnrampScreen.DepositOnchainForm &&
        (flow === "current" || flow === "connected")
          ? 550
          : undefined
      }
      label={t("deposit.flowSwitcher.label")}
      options={
        showAssetsAlternative
          ? [
              { value: "split", label: "V2 alt" },
              { value: "steps", label: "V2" },
            ]
          : [
              { value: "current", label: t("deposit.flowSwitcher.current") },
              { value: "guided", label: t("deposit.flowSwitcher.guided") },
              { value: "simple", label: t("deposit.flowSwitcher.simple") },
              {
                value: "connected",
                label: t("deposit.flowSwitcher.connected"),
              },
              { value: "choice", label: t("deposit.flowSwitcher.choice") },
            ]
      }
      onValueChange={(value) => {
        if (showAssetsAlternative && (value === "steps" || value === "split")) {
          if (value === assetsLayout) return
          useOnrampModal.setState({
            depositAssetsLayout: value,
            walletFirstAsset: null,
            depositSourceAccount: null,
          })
          useOnrampStore
            .getState()
            .paginateTo(OnrampScreen.DepositOnchainWallet)
          return
        }
        if (value === selectedFlow) return
        if (
          value === "current" ||
          value === "guided" ||
          value === "simple" ||
          value === "connected" ||
          value === "choice"
        )
          setEntryFlow(value)
      }}
    >
      {children}
    </OnrampVariantLayout>
  )
}
