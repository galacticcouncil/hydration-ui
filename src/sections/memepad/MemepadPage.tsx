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
import { isEvmAccount } from "utils/evm"
import { Alert } from "components/Alert/Alert"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

const MemepadPageContent = () => {
  const { isLoaded } = useRpcProvider()

  const { step, submitNext, isFinalized, isLoading, summary, reset } =
    useMemepadFormContext()

  return (
    <>
      {isFinalized ? (
        <MemepadSummary values={summary} onReset={reset} />
      ) : (
        <MemepadLayout>
          {isLoaded ? <MemepadForm /> : <MemepadSpinner />}
          <MemepadActionBar
            step={step}
            isLoading={isLoading}
            isRegistering={!!summary?.id}
            onNext={submitNext}
          />
        </MemepadLayout>
      )}
      <RouteBlockModal />
    </>
  )
}

export const MemepadPage = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { disconnect } = useWeb3ConnectStore()

  if (!account) {
    return (
      <MemepadLayout>
        <Web3ConnectModalButton sx={{ width: "100%" }} />
      </MemepadLayout>
    )
  }

  if (isEvmAccount(account.address)) {
    return (
      <MemepadLayout>
        <Alert variant="warning">
          <div sx={{ flex: ["column", "row"], gap: 10 }}>
            <Text>{t("memepad.alert.evmAccount")}</Text>
            <Button
              variant="outline"
              size="small"
              onClick={disconnect}
              css={{ borderColor: "white" }}
            >
              {t("walletConnect.logout")}
            </Button>
          </div>
        </Alert>
      </MemepadLayout>
    )
  }

  return (
    <MemepadFormProvider key={account.address}>
      <MemepadPageContent />
    </MemepadFormProvider>
  )
}
