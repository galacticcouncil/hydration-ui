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

export type SwapSettingsSection = "single" | "split"

type Props = {
  readonly section?: SwapSettingsSection
}

export const SwapSettingsModal: FC<Props> = ({ section }) => {
  const { t } = useTranslation(["common", "trade"])

  const { update, ...tradeSettings } = useTradeSettings()
  const form = useSwapSettingsForm(tradeSettings.swap, (swap) =>
    update({ ...tradeSettings, swap }),
  )

  const showSingle = !section || section === "single"
  const showSplit = !section || section === "split"

  return (
    <FormProvider {...form}>
      <ModalHeader
        title={t("trade:swap.settings.modal.title")}
        description={t("trade:swap.settings.modal.description")}
      />
      <ModalBody sx={{ minHeight: ["auto", 400], pt: 0 }}>
        <form onSubmit={preventDefault}>
          {showSingle && <SingleTradeSection />}
          {showSingle && showSplit && <ModalContentDivider />}
          {showSplit && <SplitTradeSection />}
        </form>
      </ModalBody>
    </FormProvider>
  )
}
