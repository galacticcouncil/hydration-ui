import React from "react"
import { ModalType, useModalContext } from "sections/lending/hooks/useModal"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { StakeCooldownModalContent } from "./StakeCooldownModalContent"

export const StakeCooldownModal = () => {
  const { type, close, args } = useModalContext()
  return (
    <BasicModal open={type === ModalType.StakeCooldown} setOpen={close}>
      {args?.stakeAssetName && (
        <StakeCooldownModalContent stakeAssetName={args.stakeAssetName} />
      )}
    </BasicModal>
  )
}
