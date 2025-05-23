import { BasicModal } from "@/components/primitives"
import { ModalContextType, ModalType, useModalContext } from "@/hooks/useModal"

import { EmodeModalContent, EmodeModalType } from "./EmodeModalContent"

export const EmodeModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    emode: EmodeModalType
  }>
  return (
    <BasicModal
      open={type === ModalType.Emode}
      setOpen={close}
      title="Manage E-Mode"
    >
      <EmodeModalContent mode={args.emode} />
    </BasicModal>
  )
}
