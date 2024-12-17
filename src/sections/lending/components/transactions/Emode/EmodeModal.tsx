import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "sections/lending/hooks/useModal"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { EmodeModalContent, EmodeModalType } from "./EmodeModalContent"
import { ModalContents } from "components/Modal/contents/ModalContents"

export const EmodeModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    emode: EmodeModalType
  }>
  return (
    <BasicModal open={type === ModalType.Emode} setOpen={close}>
      <ModalContents
        sx={{ color: "white" }}
        onClose={close}
        contents={[
          {
            title: `${args.emode} E-Mode`,
            content: <EmodeModalContent mode={args.emode} />,
          },
        ]}
      />
    </BasicModal>
  )
}
