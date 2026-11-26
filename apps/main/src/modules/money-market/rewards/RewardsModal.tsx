import { Modal, ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  type RewardsDistributorAccrued,
  type RewardsDistributorClaim,
} from "@/api/rewardsDistributor"
import { useClaimRewards } from "@/modules/money-market/rewards/RewardsModal.tx"
import { RewardsModalContent } from "@/modules/money-market/rewards/RewardsModalContent"

type RewardsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  claim: RewardsDistributorClaim
  accrued: RewardsDistributorAccrued
}

/**
 * The money market's and the distributor's rewards, claimed together or one
 * at a time. For the main market, the one the distributor pays on.
 */
export const RewardsModal: FC<RewardsModalProps> = ({
  open,
  onOpenChange,
  claim,
  accrued,
}) => {
  const { t } = useTranslation("borrow")
  // here and not in the content, which unmounts as the window closes on a claim
  const { mutate, isPending: isClaiming } = useClaimRewards()

  return (
    <Modal open={open} onOpenChange={onOpenChange} variant="popup">
      <ModalHeader title={t("rewards.title")} />
      <ModalBody scrollable={false}>
        {/* mounted while open only, so every opening starts at all rewards */}
        <RewardsModalContent
          claim={claim}
          accrued={accrued}
          isClaiming={isClaiming}
          onClaim={(selection) => {
            onOpenChange(false)
            mutate(selection)
          }}
        />
      </ModalBody>
    </Modal>
  )
}
