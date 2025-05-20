import {
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { SingleTradeSection } from "@/modules/trade/components/SettingsModal/SingleTradeSection"
import { SplitTradeSection } from "@/modules/trade/components/SettingsModal/SplitTradeSection"
import { useTradeSettingsForm } from "@/modules/trade/components/SettingsModal/useTradeSettingsForm"
import { useTradeSettings } from "@/states/tradeSettings"

type Props = {
  readonly onOpenChange: (value: boolean) => void
}

export const SettingsModal = ({ onOpenChange }: Props) => {
  const { t } = useTranslation(["common", "trade"])

  const { update, ...tradeSettings } = useTradeSettings()
  const form = useTradeSettingsForm(tradeSettings, update)

  return (
    <Modal open onOpenChange={onOpenChange}>
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
    </Modal>
  )
}
