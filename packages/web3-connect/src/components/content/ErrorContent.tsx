import {
  Alert,
  ModalBody,
  ModalHeader,
  TextButton,
} from "@galacticcouncil/ui/components"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useWeb3Connect, useWeb3Enable } from "@/hooks"

export const ErrorContent = () => {
  const { error, recentProvider } = useWeb3Connect(
    useShallow(pick(["error", "recentProvider"])),
  )

  const { enable } = useWeb3Enable({ disconnectOnError: true })
  return (
    <>
      <ModalHeader title="Connection error" align="center" />
      <ModalBody>
        <Alert
          variant="error"
          description={error || "Unknown error, please try again"}
          action={
            recentProvider ? (
              <TextButton
                variant="underline"
                onClick={() => enable(recentProvider)}
              >
                Retry
              </TextButton>
            ) : undefined
          }
        />
      </ModalBody>
    </>
  )
}
