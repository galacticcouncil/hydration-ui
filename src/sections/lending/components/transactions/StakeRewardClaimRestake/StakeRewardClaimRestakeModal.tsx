import React from "react"
import { ModalType, useModalContext } from "sections/lending/hooks/useModal"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { StakeRewardClaimRestakeModalContent } from "./StakeRewardClaimRestakeModalContent"

export const StakeRewardClaimRestakeModal = () => {
  const { type, close, args } = useModalContext()
  return (
    <BasicModal
      open={type === ModalType.StakeRewardsClaimRestake}
      setOpen={close}
    >
      {args?.icon && args?.stakeAssetName && (
        <StakeRewardClaimRestakeModalContent
          stakeAssetName={args.stakeAssetName}
          icon={args.icon}
        />
      )}
    </BasicModal>
  )
}
