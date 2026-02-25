import { Button, Modal, ModalBody } from "@galacticcouncil/ui/components"
import { WalletMode, Web3ConnectModal } from "@galacticcouncil/web3-connect"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useSquidClient } from "@/api/provider"
import { ClaimPendingModalContent } from "@/modules/xcm/history/components/ClaimPendingModalContent"
import { useWithdrawClaim } from "@/modules/xcm/history/hooks/useWithdrawClaim"
import { resolveChainFromUrn } from "@/modules/xcm/history/utils/claim"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"

type ClaimButtonProps = {
  journey: XcJourney
}

export const ClaimButton: React.FC<ClaimButtonProps> = ({ journey }) => {
  const { t } = useTranslation("common")
  const squidSdk = useSquidClient()
  const [modalOpen, setModalOpen] = useState(false)

  const chain = resolveChainFromUrn(journey.destination)
  const walletMode = chain ? getWalletModeByChain(chain) : WalletMode.EVM

  const { mutate, isPending, isWaitingForSignature } = useWithdrawClaim(journey)

  return (
    <>
      <Button
        variant="secondary"
        size="small"
        disabled={isPending}
        onClick={() => setModalOpen(true)}
      >
        {isPending ? t("claiming") : t("claim")}
      </Button>
      <Web3ConnectModal
        squidSdk={squidSdk}
        open={modalOpen}
        mode={walletMode}
        onOpenChange={setModalOpen}
        onAccountSelect={(account) => {
          setModalOpen(false)
          mutate(account)
        }}
      />
      <Modal open={isWaitingForSignature}>
        <ModalBody>
          <ClaimPendingModalContent />
        </ModalBody>
      </Modal>
    </>
  )
}
