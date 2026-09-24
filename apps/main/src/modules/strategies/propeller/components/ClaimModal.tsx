import {
  LoadingButton,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import {
  useClaim,
  usePendingClaimIds,
} from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  row: PropellerWithdrawalRow | null
  onClose: () => void
}

export const ClaimModal = ({ row, onClose }: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const { getAssetWithFallback } = useAssets()
  const claim = useClaim({ onSuccess: onClose })
  const claimingIds = usePendingClaimIds()

  const symbol = row
    ? getAssetWithFallback(row.vault.assetId).symbol
    : undefined
  const isClaiming = row ? claimingIds.includes(row.id) : false

  const handleClaim = () => {
    if (!row || isClaiming) return
    claim.mutate({ vault: row.vault, requestId: row.requestId })
  }

  return (
    <Modal
      variant="popup"
      open={!!row}
      onOpenChange={onClose}
      disableInteractOutside
    >
      <ModalHeader title={t("claim.modal.title", { symbol: symbol ?? "" })} />
      <ModalBody>
        {row && (
          <Text fs="p4" color={getToken("text.medium")}>
            {t("claim.modal.description", {
              amount: t("common:currency", {
                value: row.estEth,
                symbol: symbol ?? "",
              }),
              usd: t("common:currency", { value: row.estUsd }),
            })}
          </Text>
        )}
      </ModalBody>
      <ModalFooter>
        <LoadingButton
          size="large"
          width="100%"
          onClick={handleClaim}
          isLoading={isClaiming}
          disabled={!row || isClaiming}
        >
          {t("withdrawals.action.claim")}
        </LoadingButton>
      </ModalFooter>
    </Modal>
  )
}
