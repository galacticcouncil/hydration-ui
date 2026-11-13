import { Flex } from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"

import { BankPortfolio } from "@/modules/onramp/bank/components/BankPortfolio"
import {
  BankEntry,
  useBankEntryStore,
} from "@/modules/onramp/bank/store/useBankEntryStore"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"

/** Portfolio, Deposits: the bank set-up status and the bank transfer history. */
export const PortfolioDepositsPage = () => {
  const navigate = useNavigate()

  const open = (entry: BankEntry) => {
    useBankEntryStore.getState().open(entry)
    const deposit = entry.direction === "deposit"
    useOnrampStore
      .getState()
      .paginateTo(
        deposit ? OnrampScreen.DepositBank : OnrampScreen.WithdrawBank,
      )
    void navigate({ to: deposit ? "/deposit" : "/withdraw" })
  }

  return (
    <Flex direction="column" gap="xl">
      <BankPortfolio onOpen={open} />
    </Flex>
  )
}
