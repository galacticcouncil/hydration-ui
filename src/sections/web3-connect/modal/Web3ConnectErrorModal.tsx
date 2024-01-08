import { Button } from "components/Button/Button"
import { Alert } from "components/Alert/Alert"
import { Text } from "components/Typography/Text/Text"

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
      <Alert variant="error">
        <Text lh={24}>{message}</Text>
      </Alert>
      <Button onClick={onRetry} sx={{ mt: 20 }} variant="primary">
        Retry
      </Button>
    </>
  )
}
