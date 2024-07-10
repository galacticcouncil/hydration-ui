import { Spacer } from "components/Spacer/Spacer"
import { useRouteBlock } from "hooks/useRouteBlock"
import { SContent } from "./MemepadPage.styled"
import { MemepadActionBar } from "./components/MemepadActionBar"
import { MemepadVisual } from "./components/MemepadVisual"
import { MemepadHeader } from "./components/MemepadHeader"
import { useMemepadForms } from "./form/MemepadForm.utils"
import { RouteBlockModal } from "./modal/RouteBlockModal"
import { MemepadSummary } from "sections/memepad/components/MemepadSummary"
import { useRpcProvider } from "providers/rpcProvider"
import { MemepadForm } from "./form/MemepadForm"
import { MemepadSpinner } from "./components/MemepadSpinner"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"

const MemepadPageContent = () => {
  const { isLoaded } = useRpcProvider()

  const context = useMemepadForms()
  const { submitNext, isFinalStep, isDirty, isSubmitted, summary, reset } =
    context

  const { isBlocking, accept, cancel } = useRouteBlock(isDirty && !isSubmitted)

  return (
    <>
      {isFinalStep ? (
        <MemepadSummary values={summary} onReset={reset} />
      ) : (
        <>
          <MemepadHeader />
          <Spacer size={35} />
          <SContent>
            {isLoaded ? <MemepadForm {...context} /> : <MemepadSpinner />}
            <MemepadVisual />
          </SContent>
          <MemepadActionBar onNext={submitNext} />
        </>
      )}
      <RouteBlockModal open={isBlocking} onAccept={accept} onCancel={cancel} />
    </>
  )
}

export const MemepadPage = () => {
  const { account } = useAccount()

  return account ? (
    <MemepadPageContent key={account?.address} />
  ) : (
    <>
      <MemepadHeader />
      <Spacer size={35} />
      <SContent>
        <Web3ConnectModalButton />
        <MemepadVisual />
      </SContent>
    </>
  )
}
