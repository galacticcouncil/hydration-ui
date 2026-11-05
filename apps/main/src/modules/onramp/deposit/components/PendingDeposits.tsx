import {
  Box,
  ModalBody,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/shallow"

import { PendingDeposit } from "@/modules/onramp/components/PendingDeposit"
import {
  selectPendingDepositsByAccount,
  useOnrampStore,
} from "@/modules/onramp/store/useOnrampStore"

export const PendingDeposits = () => {
  const { account } = useAccount()
  const { t } = useTranslation("onramp")
  const deposits = useOnrampStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )
  if (!deposits.length) return null

  return (
    <ModalBody>
      <Stack gap="l">
        <Box px="xl">
          <Text fs="p2" fw={500} font="primary" align="center">
            {t("deposit.cex.transfer.ongoing.title")}
          </Text>
        </Box>
        <Separator />
        <Stack gap="m">
          {deposits.map((deposit) => (
            <PendingDeposit key={deposit.id} {...deposit} />
          ))}
        </Stack>
      </Stack>
    </ModalBody>
  )
}
