import { CheckIcon, CopyIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  CopyButton,
  Icon,
  MicroButton,
  Modal,
  ModalBody,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { WalletMode, Web3ConnectModal } from "@galacticcouncil/web3-connect"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useSquidClient } from "@/api/provider"
import { TransactionStatus } from "@/components/TransactionStatus"
import { ClaimPendingModalContent } from "@/modules/xcm/history/components/ClaimPendingModalContent"
import { useWithdrawClaim } from "@/modules/xcm/history/hooks/useWithdrawClaim"
import { getTransferAsset } from "@/modules/xcm/history/utils/assets"
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

  const { mutate, isPending, isWaitingForSignature, error, reset } =
    useWithdrawClaim(journey)

  const transferAsset = getTransferAsset(journey.assets)

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
      <Modal
        open={isWaitingForSignature || !!error}
        onOpenChange={error ? reset : undefined}
      >
        <ModalHeader
          title={
            transferAsset ? `${t("claim")} ${transferAsset.symbol}` : t("claim")
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
                    <MicroButton
                      as="div"
                      sx={{
                        color: copied && getToken("accents.success.emphasis"),
                      }}
                    >
                      <Icon
                        size="xs"
                        component={copied ? CheckIcon : CopyIcon}
                      />
                      {copied ? t("copied") : t("copyError")}
                    </MicroButton>
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
