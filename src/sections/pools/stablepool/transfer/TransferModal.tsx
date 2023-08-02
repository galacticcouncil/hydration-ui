import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./TransferOptions"
import { useState } from "react"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const TransferModal = ({ isOpen, onClose }: Props) => {
  const [page] = useState(0)

  return (
    <Modal open={isOpen} onClose={onClose} disableCloseOutside={true}>
      <ModalContents
        onClose={onClose}
        page={page}
        contents={[
          {
            title: "Add Liquidity",
            headerVariant: "gradient",
            content: <TransferOptions />,
          },
          {
            title: "Title 2",
            headerVariant: "simple",
            content: <div>content 2 </div>,
          },
          {
            title: "Title 3",
            headerVariant: "simple",
            content: <div>content 3</div>,
          },
        ]}
      />
    </Modal>
  )
}
