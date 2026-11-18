import {
  ArrowRightLeftIcon,
  CreditCardIcon,
  LandmarkIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/shallow"

import { ENV } from "@/config/env"
import { PendingDeposit } from "@/modules/onramp/components/PendingDeposit"
import { StepButton } from "@/modules/onramp/components/StepButton"
import { useOnrampClosable } from "@/modules/onramp/hooks/useOnrampClosable"
import {
  selectPendingDepositsByAccount,
  useOnrampStore,
} from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"

export type DepositMethodSelectProps = {
  onSelect: (page: OnrampScreen) => void
}

export const DepositMethodSelect: React.FC<DepositMethodSelectProps> = ({
  onSelect,
}) => {
  const { t } = useTranslation(["onramp"])
  const closable = useOnrampClosable()
  const { account } = useAccount()
  const pendingDeposits = useOnrampStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )

  return (
    <>
      <ModalHeader
        title={t("deposit.method.title")}
        closable={closable}
        align="center"
      />
      <ModalBody>
        <Stack gap="m">
          <StepButton
            icon={LandmarkIcon}
            onClick={() => onSelect(OnrampScreen.DepositAssetSelect)}
            title={t("deposit.method.cex.title")}
            description={t("deposit.method.cex.description")}
          />
          <StepButton
            icon={ArrowRightLeftIcon}
            onClick={() => onSelect(OnrampScreen.DepositOnchainHoldings)}
            title={t("deposit.method.onchain.title")}
            description={t("deposit.method.onchain.description")}
          />
          {ENV.VITE_ENV !== "production" && (
            <StepButton
              icon={CreditCardIcon}
              onClick={() => onSelect(OnrampScreen.DepositBank)}
              title={t("deposit.method.bank.title")}
              description={t("deposit.method.bank.description")}
            />
          )}
        </Stack>
        {pendingDeposits.length > 0 && (
          <>
            <ModalContentDivider />
            <Stack gap="m">
              <Text fs="p2" fw={500} font="primary" align="center">
                {t("deposit.cex.transfer.ongoing.title")}
              </Text>
              {pendingDeposits.map((deposit) => (
                <PendingDeposit key={deposit.id} {...deposit} />
              ))}
            </Stack>
          </>
        )}
      </ModalBody>
    </>
  )
}
