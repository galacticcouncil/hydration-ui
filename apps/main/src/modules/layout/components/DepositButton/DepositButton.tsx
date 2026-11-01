import { useAccount } from "@galacticcouncil/web3-connect"
import { useLocation } from "@tanstack/react-router"
import { MouseEventHandler } from "react"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/shallow"

import { InlineCountBadge } from "@/components/InlineCountBadge"
import { useClaimableDeposits } from "@/modules/onramp/deposit/hooks/useClaimableDeposits"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import {
  selectPendingDepositsByAccount,
  useOnrampStore,
} from "@/modules/onramp/store/useOnrampStore"

import { SDepositButton } from "./DepositButton.styled"

type DepositButtonProps = {
  onClaimClick: MouseEventHandler<HTMLElement>
}

export const DepositButton = ({ onClaimClick }: DepositButtonProps) => {
  const { t } = useTranslation("common")
  const { account } = useAccount()
  const setModal = useOnrampModal((state) => state.setModal)
  const pathname = useLocation({ select: (location) => location.pathname })
  const liveClaims = useClaimableDeposits()
  const v3Transfers = useDepositJourneyStore((state) => state.pendingTransfers)
  const claimCount = liveClaims.length
  const claimAttention = claimCount > 0 && pathname !== "/portfolio/deposits"
  const pendingDeposits = useOnrampStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )
  const count =
    pendingDeposits.length + v3Transfers.filter((item) => !item.error).length

  if (!account) return null

  return (
    <SDepositButton
      variant="accent"
      outline
      claimAttention={claimAttention}
      data-claim-attention={claimAttention || undefined}
      glow={claimAttention || count > 0}
      aria-label={
        claimAttention
          ? t("deposit.toClaimLabel", { count: claimCount })
          : undefined
      }
      onClick={(event) => {
        if (claimAttention) {
          onClaimClick(event)
          return
        }
        const transfer = v3Transfers.filter((item) => !item.error).at(-1)
        if (transfer) {
          useOnrampModal
            .getState()
            .openOnchain("preview", { resume: true, txHash: transfer.txHash })
        } else setModal("deposit")
      }}
    >
      {claimAttention ? (
        <>
          {t("deposit.toClaim", { count: claimCount })}
          <InlineCountBadge aria-hidden>
            {t("number", { value: claimCount })}
          </InlineCountBadge>
        </>
      ) : count > 0 ? (
        t("deposit.pending", { count })
      ) : (
        t("deposit")
      )}
    </SDepositButton>
  )
}
