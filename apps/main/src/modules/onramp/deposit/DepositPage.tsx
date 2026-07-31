import {
  Box,
  Flex,
  ModalContainer,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"
import { useUnmount } from "react-use"
import { useShallow } from "zustand/shallow"

import { PendingDeposit } from "@/modules/onramp/components/PendingDeposit"
import { useDeposit } from "@/modules/onramp/deposit/hooks/useDeposit"
import { DepositAsset } from "@/modules/onramp/deposit/steps/DepositAsset"
import { DepositBank } from "@/modules/onramp/deposit/steps/DepositBank"
import { DepositCexSelect } from "@/modules/onramp/deposit/steps/DepositCexSelect"
import { DepositMethodSelect } from "@/modules/onramp/deposit/steps/DepositMethodSelect"
import { DepositSuccess } from "@/modules/onramp/deposit/steps/DepositSuccess"
import { DepositTransfer } from "@/modules/onramp/deposit/steps/DepositTransfer"
import {
  selectPendingDepositsByAccount,
  useOnrampStore,
} from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"

export const DepositPage = () => {
  const { t } = useTranslation(["onramp"])
  const { account } = useAccount()

  const { asset, page, setAsset, setTransfer, setSuccess, reset, paginateTo } =
    useDeposit()

  useUnmount(reset)

  const isMultiStepTransfer = asset
    ? asset.depositChain !== HYDRATION_CHAIN_KEY
    : false

  const pendingDeposits = useOnrampStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )

  const showPendingDeposits =
    page === OnrampScreen.MethodSelect && pendingDeposits.length > 0

  return (
    <Flex direction="column" align="center">
      <ModalContainer open>
        {page === OnrampScreen.MethodSelect && (
          <DepositMethodSelect onSelect={paginateTo} />
        )}

        {page === OnrampScreen.DepositAssetSelect && (
          <DepositCexSelect
            onAssetSelect={setAsset}
            onBack={() => paginateTo(OnrampScreen.MethodSelect)}
          />
        )}

        {page === OnrampScreen.DepositAsset && (
          <DepositAsset
            onDepositSuccess={isMultiStepTransfer ? setTransfer : setSuccess}
            onBack={() => paginateTo(OnrampScreen.DepositAssetSelect)}
          />
        )}

        {page === OnrampScreen.DepositTransfer && (
          <DepositTransfer
            onTransferSuccess={setSuccess}
            onBack={() => paginateTo(OnrampScreen.DepositAssetSelect)}
          />
        )}

        {page === OnrampScreen.DepositBank && (
          <DepositBank onBack={() => paginateTo(OnrampScreen.MethodSelect)} />
        )}
        {page === OnrampScreen.DepositSuccess && (
          <DepositSuccess onConfirm={reset} />
        )}
      </ModalContainer>

      {showPendingDeposits && (
        <Stack as={Paper} mt="m" maxWidth="6xl" width="100%" py="l" gap="l">
          <Box px="xl">
            <Text fs="p2" fw={500} font="primary" align="center">
              {t("deposit.cex.transfer.ongoing.title")}
            </Text>
          </Box>
          <Separator />
          <Stack gap="m" px="xl">
            {pendingDeposits.map((deposit) => (
              <PendingDeposit key={deposit.id} {...deposit} />
            ))}
          </Stack>
        </Stack>
      )}
    </Flex>
  )
}
