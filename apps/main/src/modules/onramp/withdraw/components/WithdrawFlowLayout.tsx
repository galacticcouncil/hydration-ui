import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { OnrampVariantLayout } from "@/modules/onramp/components/OnrampVariantLayout"
import {
  isWalletFirstWithdrawFlow,
  useOnrampModal,
} from "@/modules/onramp/store/useOnrampModal"

type WithdrawFlowLayoutProps = {
  children: ReactNode
}

export const WithdrawFlowLayout: FC<WithdrawFlowLayoutProps> = ({
  children,
}) => {
  const { t } = useTranslation("onramp")
  const flow = useOnrampModal((state) => state.withdrawFlow)
  const pending = useOnrampModal((state) => state.withdrawPending)
  const openWithdrawOnchain = useOnrampModal(
    (state) => state.openWithdrawOnchain,
  )

  return (
    <OnrampVariantLayout
      value={flow}
      desktopMinHeight={isWalletFirstWithdrawFlow(flow) ? 550 : undefined}
      disabled={pending}
      label={t("withdraw.flowSwitcher.label")}
      options={[
        { value: "current", label: t("withdraw.flowSwitcher.current") },
        { value: "guided", label: t("withdraw.flowSwitcher.guided") },
        { value: "simple", label: t("withdraw.flowSwitcher.simple") },
        { value: "connected", label: t("withdraw.flowSwitcher.connected") },
      ]}
      onValueChange={(value) => {
        if (
          value !== flow &&
          (value === "current" ||
            value === "guided" ||
            value === "simple" ||
            value === "connected")
        )
          openWithdrawOnchain(value)
      }}
    >
      {children}
    </OnrampVariantLayout>
  )
}
