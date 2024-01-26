import React from "react"
import { ModalType, useModalContext } from "sections/lending/hooks/useModal"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { StakeModalContent } from "./StakeModalContent"

export const StakeModal = () => {
  const { type, close, args } = useModalContext()
  return (
    <BasicModal open={type === ModalType.Stake} setOpen={close}>
      {args?.icon && args?.stakeAssetName && (
        <StakeModalContent
          icon={args.icon}
          stakeAssetName={args.stakeAssetName}
        />
      )}
    </BasicModal>
  )
}
