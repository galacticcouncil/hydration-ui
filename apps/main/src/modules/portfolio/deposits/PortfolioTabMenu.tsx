import { accountPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useShallow } from "zustand/shallow"

import { TabItem, TabMenu } from "@/components/TabMenu"
import { LINKS } from "@/config/navigation"
import { findDepositJourney } from "@/modules/onramp/deposit/DepositTracking.utils"
import { useClaimableDeposits } from "@/modules/onramp/deposit/hooks/useClaimableDeposits"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import {
  selectPendingDepositsByAccount,
  useOnrampStore,
} from "@/modules/onramp/store/useOnrampStore"

import { SPortfolioTabMenuItem } from "./PortfolioTabMenu.styled"

type PortfolioTabMenuProps = {
  readonly items: ReadonlyArray<TabItem>
  readonly ignoreCurrentSearch?: boolean
}

export const PortfolioTabMenu: FC<PortfolioTabMenuProps> = ({
  items,
  ignoreCurrentSearch,
}) => {
  const { account } = useAccount()
  const claims = useClaimableDeposits()
  const pendingDeposits = useOnrampStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )
  const transfers = useDepositJourneyStore((state) => state.pendingTransfers)
  const recipientKeys = new Set(
    [account?.rawAddress ?? "", account?.address ?? ""]
      .map(accountPublicKey)
      .filter(Boolean),
  )
  const pendingTransferCount = transfers.filter(
    (transfer) =>
      !transfer.settled &&
      !transfer.error &&
      recipientKeys.has(accountPublicKey(transfer.destinationAddress)) &&
      !findDepositJourney(transfer, claims),
  ).length
  const count = claims.length + pendingDeposits.length + pendingTransferCount

  return (
    <TabMenu
      items={items}
      scrollable={false}
      renderItem={(item) => (
        <SPortfolioTabMenuItem
          item={item}
          size="medium"
          variant="transparent"
          ignoreCurrentSearch={ignoreCurrentSearch}
          badge={
            item.to === LINKS.portfolioDeposits && count > 0 ? count : undefined
          }
        />
      )}
    />
  )
}
