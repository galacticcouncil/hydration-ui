import React from "react"
import { ModalType, useModalContext } from "sections/lending/hooks/useModal"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { UnStakeModalContent } from "./UnStakeModalContent"

export const UnStakeModal = () => {
  const { type, close, args } = useModalContext()
  return (
    <BasicModal open={type === ModalType.Unstake} setOpen={close}>
      {args?.icon && args?.stakeAssetName && (
        <UnStakeModalContent
          icon={args.icon}
          stakeAssetName={args.stakeAssetName}
        />
      )}
    </BasicModal>
  )
}
