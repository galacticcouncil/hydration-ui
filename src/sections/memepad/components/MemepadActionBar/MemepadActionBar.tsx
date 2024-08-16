import { Button } from "components/Button/Button"
import { SContainer } from "./MemepadActionBar.styled"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { isEvmAccount } from "utils/evm"

type MemepadActionBarProps = {
  step: number
  disabled?: boolean
  isLoading?: boolean
  onSubmit?: () => void
}

export const MemepadActionBar: React.FC<MemepadActionBarProps> = ({
  step,
  disabled = false,
  isLoading = false,
  onSubmit,
}) => {
  const { account } = useAccount()
  const { t } = useTranslation()
  return (
    <SContainer>
      {account ? (
        <Button
          disabled={disabled || isLoading || isEvmAccount(account?.address)}
          isLoading={isLoading}
          variant="primary"
          onClick={onSubmit}
        >
          {step === 0 && t("memepad.form.submit.create")}
          {step === 1 && t("memepad.form.submit.register")}
          {step === 2 && t("memepad.form.submit.transfer")}
          {step === 3 && t("memepad.form.submit.finish")}
        </Button>
      ) : (
        <Web3ConnectModalButton />
      )}
    </SContainer>
  )
}
