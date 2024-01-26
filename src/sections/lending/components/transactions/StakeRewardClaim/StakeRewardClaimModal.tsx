import React from "react"
import { ModalType, useModalContext } from "sections/lending/hooks/useModal"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { StakeRewardClaimModalContent } from "./StakeRewardClaimModalContent"

export const StakeRewardClaimModal = () => {
  const { type, close, args } = useModalContext()
  return (
    <BasicModal open={type === ModalType.StakeRewardClaim} setOpen={close}>
      {args?.icon && args?.stakeAssetName && (
        <StakeRewardClaimModalContent
          stakeAssetName={args.stakeAssetName}
          icon={args.icon}
        />
      )}
    </BasicModal>
  )
}
