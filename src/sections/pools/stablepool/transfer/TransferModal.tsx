import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./TransferOptions"
import { ComponentProps, useState } from 'react'
import { Button } from 'components/Button/Button'
import { useTranslation } from 'react-i18next'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const TransferModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation();
  const [page] = useState(0)
  const [option, setOption] = useState<ComponentProps<typeof TransferOptions>['selected']>('OMNIPOOL')

  return (
    <Modal open={isOpen} onClose={onClose} disableCloseOutside={true}>
      <ModalContents
        onClose={onClose}
        page={page}
        contents={[
          {
            title: "Add Liquidity",
            headerVariant: "gradient",
            content: (
              <>
                <TransferOptions onSelect={setOption} selected={option} />
                <Button variant="primary" sx={{ mt: 21 }}>{t('next')}</Button>
              </>
            ),
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
