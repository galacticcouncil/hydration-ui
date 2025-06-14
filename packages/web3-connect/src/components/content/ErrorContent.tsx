import { Alert, ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useWeb3Connect } from "@/hooks"

export const ErrorContent = () => {
  const { error } = useWeb3Connect(useShallow(pick(["error"])))
  return (
    <>
      <ModalHeader title="Connection error" />
      <ModalBody>
        <Alert
          variant="error"
          description={error || "Unknown error, please try again"}
        />
      </ModalBody>
    </>
  )
}
