import { Button } from "components/Button/Button"
import { SErrorMessage } from "./Web3ConnectErrorModal.styled"

export type Web3ConnectErrorModalProps = {
  message?: string
  onRetry?: () => void
}

export const Web3ConnectErrorModal: React.FC<Web3ConnectErrorModalProps> = ({
  message,
  onRetry,
}) => {
  return (
    <>
      <SErrorMessage>{message}</SErrorMessage>
      <Button onClick={onRetry} sx={{ mt: 20 }} variant="primary">
        Retry
      </Button>
    </>
  )
}
