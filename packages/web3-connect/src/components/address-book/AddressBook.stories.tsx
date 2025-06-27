import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { Meta } from "@storybook/react"
import { FC, useState } from "react"

import { AddressBookModal } from "@/components/address-book/AddressBookModal"

import { AddressBook } from "./AddressBook"

export default {
  component: AddressBook,
} satisfies Meta<typeof AddressBook>

export const AddressBookStory: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [address, setAddress] = useState(
    "0x1234567890123456789012345678901234567890",
  )

  return (
    <>
      <AddressBook
        address={address}
        onAddressChange={setAddress}
        onOpenMyContacts={() => setIsModalOpen(true)}
      />
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AddressBookModal
          header={<ModalHeader title="My custom address book modal" />}
          onSelect={(address) => {
            setAddress(address.address)
            setIsModalOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
