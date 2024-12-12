import { MemepadActionBar } from "./components/MemepadActionBar"
import { RouteBlockModal } from "./modal/RouteBlockModal"
import { MemepadSummary } from "sections/memepad/components/MemepadSummary"
import { useRpcProvider } from "providers/rpcProvider"
import { MemepadForm } from "./form/MemepadForm"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { MemepadLayout } from "./components/MemepadLayout"
import {
  MemepadFormProvider,
  useMemepadFormContext,
} from "./form/MemepadFormContext"
import { useMemepadEstimatedFees } from "./form/MemepadForm.utils"
import { isEvmAccount } from "utils/evm"
import { Alert } from "components/Alert/Alert"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { DegenModeModal } from "components/Layout/Header/DegenMode/DegenModeModal"
import { useEffect, useRef, useState } from "react"
import { useSettingsStore } from "state/store"

const MemepadPageContent = () => {
  const { isLoaded } = useRpcProvider()
  const { t } = useTranslation()
  const { account } = useAccount()
  const { disconnect } = useWeb3ConnectStore()

  const { step, submit, isFinalized, isLoading, form, reset } =
    useMemepadFormContext()

  const { isLoading: isFeesLoading } = useMemepadEstimatedFees()

  const submitDisabled = !isLoaded || isFeesLoading

  return (
    <>
      {isFinalized ? (
        <MemepadSummary values={form.getValues()} onReset={reset} />
      ) : (
        <MemepadLayout>
          {isEvmAccount(account?.address) && (
            <Alert variant="warning" sx={{ mb: 30 }}>
              <div sx={{ flex: ["column", "row"], gap: 10 }}>
                <Text>{t("memepad.alert.evmAccount")}</Text>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => disconnect(account?.provider)}
                  css={{ borderColor: "white" }}
                >
                  {t("walletConnect.logout")}
                </Button>
              </div>
            </Alert>
          )}
          <MemepadForm />
          <MemepadActionBar
            step={step}
            disabled={submitDisabled}
            isLoading={isLoading}
            onSubmit={submit}
          />
        </MemepadLayout>
      )}
      <RouteBlockModal />
    </>
  )
}

export const MemepadPage = () => {
  const [degenModalOpen, setDegenModalOpen] = useState(false)
  const { degenMode, toggleDegenMode } = useSettingsStore()
  const initialDegenModeState = useRef(degenMode)

  const onDegenModalClose = () => setDegenModalOpen(false)
  const onDegenModalAccept = () => {
    setDegenModalOpen(false)
    toggleDegenMode()
  }

  useEffect(() => {
    if (!initialDegenModeState.current) {
      setDegenModalOpen(true)
    }
  }, [])

  return (
    <>
      <MemepadFormProvider>
        <MemepadPageContent />
      </MemepadFormProvider>

      {degenModalOpen && (
        <DegenModeModal
          open={degenModalOpen}
          onClose={onDegenModalClose}
          onAccept={onDegenModalAccept}
        />
      )}
    </>
  )
}
