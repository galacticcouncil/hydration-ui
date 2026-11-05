import { CheckIcon, CopyIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  CopyButton,
  Modal,
  ModalBody,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  Account,
  useAccount,
  useWeb3Connect,
  WalletMode,
  Web3ConnectModal,
} from "@galacticcouncil/web3-connect"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { TransactionStatus } from "@/components/TransactionStatus"
import { ClaimPendingModalContent } from "@/modules/xcm/history/components/ClaimPendingModalContent"
import { useDepositClaim } from "@/modules/xcm/history/hooks/useDepositClaim"
import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import { useWithdrawClaim } from "@/modules/xcm/history/hooks/useWithdrawClaim"
import { getTransferAsset } from "@/modules/xcm/history/utils/assets"
import { resolveChainFromUrn } from "@/modules/xcm/history/utils/claim"
import {
  getWalletModeByChain,
  isAccountValidOnChain,
} from "@/modules/xcm/transfer/utils/chain"
import { useRpcProvider } from "@/providers/rpcProvider"

type DepositMutation = ReturnType<typeof useDepositClaim>
type WithdrawMutation = ReturnType<typeof useWithdrawClaim>

type ClaimFlowModalButtonProps = { depositAccount?: Account } & (
  | {
      type: "deposit"
      journey: XcJourney
      mutation: DepositMutation
    }
  | {
      type: "withdraw"
      journey: XcJourney
      mutation: WithdrawMutation
    }
)

export const ClaimFlowModalButton: React.FC<ClaimFlowModalButtonProps> = ({
  type,
  journey,
  mutation,
  depositAccount,
}) => {
  const { t } = useTranslation("common")
  const { papi } = useRpcProvider()
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useAccount()
  const setAccount = useWeb3Connect((state) => state.setAccount)

  const chain = resolveChainFromUrn(journey.destination)
  const walletMode = chain ? getWalletModeByChain(chain) : WalletMode.EVM

  const { mutate, isPending, error, reset } = mutation
  const pendingClaimIds = usePendingClaimsStore(
    (state) => state.pendingCorrelationIds,
  )
  const isClaimSubmitted =
    type === "deposit" && pendingClaimIds.includes(journey.correlationId)

  const transferAsset = getTransferAsset(journey)

  const signerAccount =
    type === "deposit" ? (depositAccount ?? account) : account
  if (!signerAccount) return null

  // A deposit is claimed on hydration by the active wallet, since the review
  // modal signs with it. An account that can't sign there, e.g. the NEAR
  // sender of an inbound transfer, picks a hydration account first.
  const canClaimWithActiveAccount =
    type === "deposit" && !!chain && isAccountValidOnChain(signerAccount, chain)

  const onClick = canClaimWithActiveAccount
    ? () => {
        if (type === "deposit") setAccount(signerAccount)
        mutate(signerAccount)
      }
    : () => setModalOpen(true)

  return (
    <>
      <Button
        variant="secondary"
        size="small"
        disabled={isPending || isClaimSubmitted}
        onClick={onClick}
      >
        {isPending || isClaimSubmitted ? t("claiming") : t("claim")}
      </Button>
      <Web3ConnectModal
        neckwork={neckworkClient}
        papi={papi}
        open={modalOpen}
        mode={walletMode}
        onOpenChange={setModalOpen}
        onAccountSelect={(selected) => {
          setModalOpen(false)
          // A withdraw signs with the picked wallet directly; a deposit goes
          // through the active one, so the pick becomes the active account.
          if (type === "deposit") setAccount(selected)
          mutate(selected)
        }}
      />
      <Modal
        open={isPending || !!error}
        onOpenChange={error ? reset : undefined}
      >
        <ModalHeader
          title={
            transferAsset
              ? t("claim.asset", { symbol: transferAsset.symbol })
              : t("claim")
          }
          closable={!!error}
        />
        <ModalBody>
          {error ? (
            <TransactionStatus
              status="error"
              errorActions={
                <CopyButton text={error.message}>
                  {({ copied }) => (
                    <Button
                      size="micro"
                      uppercase
                      variant="muted"
                      outline
                      as="div"
                      iconStart={copied ? CheckIcon : CopyIcon}
                      sx={{
                        color: copied && getToken("accents.success.emphasis"),
                      }}
                    >
                      {copied ? t("copied") : t("copyError")}
                    </Button>
                  )}
                </CopyButton>
              }
            />
          ) : (
            <ClaimPendingModalContent />
          )}
        </ModalBody>
      </Modal>
    </>
  )
}
