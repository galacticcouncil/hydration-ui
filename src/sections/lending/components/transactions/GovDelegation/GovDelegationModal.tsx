import React from "react"
import { ModalType, useModalContext } from "sections/lending/hooks/useModal"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { GovDelegationModalContent } from "./GovDelegationModalContent"

export const GovDelegationModal = () => {
  const { type, close } = useModalContext()
  return (
    <BasicModal
      open={
        type === ModalType.GovDelegation ||
        type === ModalType.RevokeGovDelegation
      }
      setOpen={close}
    >
      <GovDelegationModalContent
        type={
          type === ModalType.GovDelegation
            ? ModalType.GovDelegation
            : ModalType.RevokeGovDelegation
        }
      />
    </BasicModal>
  )
}
