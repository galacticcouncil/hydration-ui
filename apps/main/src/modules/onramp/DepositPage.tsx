import {
  Flex,
  ModalContainer,
  Paper,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"
import { useUnmount } from "react-use"
import { useShallow } from "zustand/shallow"

import { PendingDeposit } from "@/modules/onramp/components/PendingDeposit"
import { useDeposit } from "@/modules/onramp/hooks/useDeposit"
import { DepositAsset } from "@/modules/onramp/steps/DepositAsset"
import { DepositBank } from "@/modules/onramp/steps/DepositBank"
import { DepositCexSelect } from "@/modules/onramp/steps/DepositCexSelect"
import { DepositMethodSelect } from "@/modules/onramp/steps/DepositMethodSelect"
import { DepositSuccess } from "@/modules/onramp/steps/DepositSuccess"
import { DepositTransfer } from "@/modules/onramp/steps/DepositTransfer"
import {
  selectPendingDepositsByAccount,
  useDepositStore,
} from "@/modules/onramp/store/useDepositStore"
import { DepositMethod, DepositScreen } from "@/modules/onramp/types"

export const DepositPage = () => {
  const { t } = useTranslation(["onramp"])
  const { account } = useAccount()

  const {
    asset,
    page,
    method,
    setAsset,
    setMethod,
    setTransfer,
    setSuccess,
    reset,
    paginateBack,
  } = useDeposit()

  useUnmount(reset)

  const isMultiStepTransfer = asset ? asset.depositChain !== "hydration" : false

  const pendingDeposits = useDepositStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )

  const showPendingDeposits =
    page === DepositScreen.Select && pendingDeposits.length > 0

  console.log({ page })

  return (
    <Flex direction="column" align="center">
      <ModalContainer open>
        {page === DepositScreen.Select && (
          <DepositMethodSelect onSelect={setMethod} />
        )}

        {page === DepositScreen.Method && (
          <>
            {method === DepositMethod.DepositCex && (
              <DepositCexSelect
                onAssetSelect={setAsset}
                onBack={paginateBack}
              />
            )}
            {method === DepositMethod.DepositBank && (
              <DepositBank onBack={paginateBack} />
            )}
          </>
        )}

        {page === DepositScreen.DepositAsset && (
          <DepositAsset
            onDepositSuccess={isMultiStepTransfer ? setTransfer : setSuccess}
            onBack={paginateBack}
          />
        )}

        {page === DepositScreen.Transfer && (
          <DepositTransfer
            onTransferSuccess={setSuccess}
            onBack={paginateBack}
          />
        )}

        {page === DepositScreen.Success && <DepositSuccess onConfirm={reset} />}
      </ModalContainer>

      {showPendingDeposits && (
        <Paper p={20} mt={20} maxWidth={520} width="100%">
          <Stack gap={10}>
            <Text fs={18} fw={600}>
              {t("deposit.cex.transfer.ongoing.title")}
            </Text>
            {pendingDeposits.map((deposit) => (
              <PendingDeposit key={deposit.id} {...deposit} />
            ))}
          </Stack>
        </Paper>
      )}
    </Flex>
  )
}
