import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./TransferOptions"
import { ComponentProps, useState } from 'react'
import { Button } from 'components/Button/Button'
import { useTranslation } from 'react-i18next'
import { AddStablepoolLiquidity } from './AddStablepoolLiquidity'
import { u32 } from '@polkadot/types-codec'
import { AssetsModalContent } from '../../../assets/AssetsModal'

type Props = {
  isOpen: boolean
  onClose: () => void
  poolId: u32
}

export const TransferModal = ({ isOpen, onClose, poolId }: Props) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0)
  const [option, setOption] = useState<ComponentProps<typeof TransferOptions>['selected']>('OMNIPOOL')
  const [assetId, setAssetId] = useState<string>(poolId.toString())

  const handleBack = () => {
    if(page === 1 || page === 2) {
      return setPage(0)
    }

    if(option === 'OMNIPOOL') {
      return setPage(1);
    }

    if(option === 'STABLEPOOL') {
      return setPage(2);
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} disableCloseOutside={true}>
      <ModalContents
        onClose={onClose}
        page={page}
        onBack={page ? handleBack : undefined}
        contents={[
          {
            title: t('liquidity.stablepool.transfer.options'),
            headerVariant: "gradient",
            content: (
              <>
                <TransferOptions onSelect={setOption} selected={option} />
                <Button variant="primary" sx={{ mt: 21 }} onClick={() => setPage(option === 'OMNIPOOL' ? 1 : 2)}>{t('next')}</Button>
              </>
            ),
          },
          {
            title: "Omnipool",
            headerVariant: "gradient",
            content: <div />,
          },
          {
            title: "Stablepool",
            headerVariant: "gradient",
            content: <AddStablepoolLiquidity onSuccess={console.log} onAssetOpen={() => setPage(3)} assetId={assetId} />,
          },
          {
            title: t('selectAsset.title'),
            headerVariant: 'gradient',
            content: <AssetsModalContent onSelect={(asset) => { setAssetId(asset.id); handleBack() }} />
          }
        ]}
      />
    </Modal>
  )
}
