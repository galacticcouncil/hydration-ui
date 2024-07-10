import { useRouteBlock } from "hooks/useRouteBlock"
import { MemepadActionBar } from "./components/MemepadActionBar"
import { RouteBlockModal } from "./modal/RouteBlockModal"
import { MemepadSummary } from "sections/memepad/components/MemepadSummary"
import { useRpcProvider } from "providers/rpcProvider"
import { MemepadForm } from "./form/MemepadForm"
import { MemepadSpinner } from "./components/MemepadSpinner"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { MemepadLayout } from "./components/MemepadLayout"
import {
  MemepadFormProvider,
  useMemepadFormContext,
} from "./form/MemepadFormContext"

const MemepadPageContent = () => {
  const { isLoaded } = useRpcProvider()

  const { submitNext, isFinalStep, isDirty, isSubmitted, summary, reset } =
    useMemepadFormContext()

  const { isBlocking, accept, cancel } = useRouteBlock(isDirty && !isSubmitted)

  return (
    <>
      {isFinalStep ? (
        <MemepadSummary values={summary} onReset={reset} />
      ) : (
        <MemepadLayout>
          {isLoaded ? <MemepadForm /> : <MemepadSpinner />}
          <MemepadActionBar onNext={submitNext} />
        </MemepadLayout>
      )}
      <RouteBlockModal open={isBlocking} onAccept={accept} onCancel={cancel} />
    </>
  )
}

export const MemepadPage = () => {
  const { account } = useAccount()

  return account ? (
    <MemepadFormProvider key={account?.address}>
      <MemepadPageContent />
    </MemepadFormProvider>
  ) : (
    <MemepadLayout>
      <Web3ConnectModalButton />
    </MemepadLayout>
  )
}
