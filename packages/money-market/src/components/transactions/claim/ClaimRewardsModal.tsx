import { BasicModal } from "@/components/primitives/BasicModal"
import { ModalType, useModalContext } from "@/hooks/useModal"

import { ClaimRewardsModalContent } from "./ClaimRewardsModalContent"

export const ClaimRewardsModal = () => {
  const { type, close } = useModalContext()
  return (
    <BasicModal
      open={type === ModalType.ClaimRewards}
      setOpen={close}
      title="Claim Rewards"
    >
      <ClaimRewardsModalContent />
    </BasicModal>
  )
}
