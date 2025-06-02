import {
  ModalBody,
  ModalContentDivider,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { SingleTradeSection } from "@/modules/trade/swap/components/SettingsModal/SingleTradeSection"
import { SplitTradeSection } from "@/modules/trade/swap/components/SettingsModal/SplitTradeSection"
import { useTradeSettingsForm } from "@/modules/trade/swap/components/SettingsModal/useTradeSettingsForm"
import { useTradeSettings } from "@/states/tradeSettings"

export const SettingsModal: FC = () => {
  const { t } = useTranslation(["common", "trade"])

  const { update, ...tradeSettings } = useTradeSettings()
  const form = useTradeSettingsForm(tradeSettings, update)

  return (
    <FormProvider {...form}>
      <ModalHeader
        title={t("trade:swap.settings.modal.title")}
        description={t("trade:swap.settings.modal.description")}
      />
      <ModalContentDivider />
      <ModalBody sx={{ minHeight: ["auto", 400], pt: 0 }}>
        <form>
          <SingleTradeSection />
          <ModalContentDivider />
          <SplitTradeSection />
        </form>
      </ModalBody>
    </FormProvider>
  )
}
