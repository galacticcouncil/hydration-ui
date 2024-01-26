import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { ModalType, useModalContext } from "sections/lending/hooks/useModal"

import { GovRepresentativesContent } from "./GovRepresentativesModalContent"

export const GovRepresentativesModal = () => {
  const { type, close, args } = useModalContext()
  return (
    <BasicModal open={type === ModalType.GovRepresentatives} setOpen={close}>
      {args.representatives && (
        <GovRepresentativesContent representatives={args.representatives} />
      )}
    </BasicModal>
  )
}
