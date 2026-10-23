import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { OnrampVariantLayout } from "@/modules/onramp/components/OnrampVariantLayout"
import {
  DepositFlow,
  useOnrampModal,
} from "@/modules/onramp/store/useOnrampModal"

type DepositFlowLayoutProps = {
  flow: DepositFlow
  children: ReactNode
}

export const DepositFlowLayout: FC<DepositFlowLayoutProps> = ({
  flow,
  children,
}) => {
  const { t } = useTranslation("onramp")
  const openOnchain = useOnrampModal((state) => state.openOnchain)
  return (
    <OnrampVariantLayout
      value={flow}
      label={t("deposit.flowSwitcher.label")}
      options={[
        { value: "current", label: t("deposit.flowSwitcher.current") },
        { value: "guided", label: t("deposit.flowSwitcher.guided") },
        { value: "simple", label: t("deposit.flowSwitcher.simple") },
      ]}
      onValueChange={(value) => {
        if (
          value !== flow &&
          (value === "current" || value === "guided" || value === "simple")
        )
          openOnchain(value)
      }}
    >
      {children}
    </OnrampVariantLayout>
  )
}
