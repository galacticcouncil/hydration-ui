import {
  Alert,
  ModalBody,
  ModalHeader,
  TextButton,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useWeb3Connect, useWeb3Enable } from "@/hooks"

export const ErrorContent = () => {
  const { t } = useTranslation()
  const { error, recentProvider } = useWeb3Connect(
    useShallow(pick(["error", "recentProvider"])),
  )

  const { enable } = useWeb3Enable({ disconnectOnError: true })
  return (
    <>
      <ModalHeader title={t("error.title")} align="center" />
      <ModalBody>
        <Alert
          variant="error"
          description={error || t("error.unknown")}
          action={
            recentProvider ? (
              <TextButton
                variant="underline"
                onClick={() => enable(recentProvider)}
              >
                {t("error.retry")}
              </TextButton>
            ) : undefined
          }
        />
      </ModalBody>
    </>
  )
}
