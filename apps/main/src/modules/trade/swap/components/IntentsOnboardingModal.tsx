import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalCloseTrigger,
  ModalFooter,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useRpcProvider } from "@/providers/rpcProvider"
import { useIntentsStore } from "@/states/intents"

export const IntentsOnboardingModal: FC = () => {
  const { t } = useTranslation("trade")
  const { featureFlags } = useRpcProvider()
  const hasSeenModal = useIntentsStore((state) => state.hasSeenModal)
  const setEnabled = useIntentsStore((state) => state.setEnabled)
  const dismissModal = useIntentsStore((state) => state.dismissModal)

  const isOpen = featureFlags.isIceEnabled && !hasSeenModal

  const onOpenChange = (open: boolean) => {
    if (!open) {
      dismissModal()
    }
  }

  if (!featureFlags.isIceEnabled) {
    return null
  }

  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader
        title={t("intents.onboarding.title")}
        description={t("intents.onboarding.description")}
      />
      <ModalBody scrollable={false}>
        <Alert variant="info" description={t("intents.onboarding.hint")} />
      </ModalBody>
      <ModalFooter justify="space-between">
        <ModalCloseTrigger asChild>
          <Button size="large" variant="secondary">
            {t("intents.onboarding.cta.dismiss")}
          </Button>
        </ModalCloseTrigger>
        <ModalCloseTrigger asChild>
          <Button size="large" onClick={() => setEnabled(true)}>
            {t("intents.onboarding.cta.confirm")}
          </Button>
        </ModalCloseTrigger>
      </ModalFooter>
    </Modal>
  )
}
