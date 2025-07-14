import {
  ModalBody,
  ModalContentDivider,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { preventDefault } from "@galacticcouncil/utils"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { SingleTradeSection } from "@/modules/trade/swap/components/SettingsModal/SwapSettings/SingleTradeSection"
import { SplitTradeSection } from "@/modules/trade/swap/components/SettingsModal/SwapSettings/SplitTradeSection"
import { useSwapSettingsForm } from "@/modules/trade/swap/components/SettingsModal/SwapSettings/useSwapSettingsForm"
import { useTradeSettings } from "@/states/tradeSettings"

export const SwapSettingsModal: FC = () => {
  const { t } = useTranslation(["common", "trade"])

  const { update, ...tradeSettings } = useTradeSettings()
  const form = useSwapSettingsForm(tradeSettings.swap, (swap) =>
    update({ ...tradeSettings, swap }),
  )

  return (
    <FormProvider {...form}>
      <ModalHeader
        title={t("trade:swap.settings.modal.title")}
        description={t("trade:swap.settings.modal.description")}
      />
      <ModalBody sx={{ minHeight: ["auto", 400], pt: 0 }}>
        <form onSubmit={preventDefault}>
          <SingleTradeSection />
          <ModalContentDivider />
          <SplitTradeSection />
        </form>
      </ModalBody>
    </FormProvider>
  )
}
