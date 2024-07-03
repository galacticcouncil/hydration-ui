import { AddressBook } from "components/AddressBook/AddressBook"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { WalletTransferSectionOnchain } from "sections/wallet/transfer/onchain/WalletTransferSectionOnchain"
import { theme } from "theme"

enum ModalPage {
  Transfer,
  Assets,
  AddressBook,
}

export function WalletTransferModal(props: {
  open: boolean
  onClose: () => void
  initialAsset: string
  initialRecipient?: string
}) {
  const { t } = useTranslation()

  const [asset, setAsset] = useState(props.initialAsset)

  const form = useForm<{ dest: string; amount: string }>(
    props.initialRecipient
      ? {
          values: { dest: props.initialRecipient, amount: "" },
        }
      : {},
  )

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { page, direction, paginateTo } = useModalPagination()

  const openTransfer = () => paginateTo(ModalPage.Transfer)
  const openAssets = () => paginateTo(ModalPage.Assets)
  const openAddressBook = () => paginateTo(ModalPage.AddressBook)

  return (
    <Modal open={props.open} onClose={props.onClose} disableClose={!isDesktop}>
      <ModalContents
        page={page}
        direction={direction}
        onClose={props.onClose}
        onBack={openTransfer}
        disableAnimation
        contents={[
          {
            title: t("wallet.assets.transfer.title"),
            content: (
              <WalletTransferSectionOnchain
                asset={asset}
                form={form}
                openAssets={openAssets}
                openAddressBook={openAddressBook}
                onClose={props.onClose}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "GeistMono",
            noPadding: true,
            content: (
              <AssetsModalContent
                withExternal
                withBonds
                defaultSelectedAsssetId={asset}
                onSelect={(a) => {
                  setAsset(a.id)
                  openTransfer()
                }}
              />
            ),
          },
          {
            title: t("addressbook.title"),
            content: (
              <AddressBook
                onSelect={(address) => {
                  form.setValue("dest", address)
                  openTransfer()
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
