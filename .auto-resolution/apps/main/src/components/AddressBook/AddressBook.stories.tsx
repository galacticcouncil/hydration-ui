import { Meta } from "@storybook/react"
import { FC, useState } from "react"

import { AddressBook } from "./AddressBook"

export default {
  component: AddressBook,
} satisfies Meta<typeof AddressBook>

export const AddressBookStory: FC = () => {
  const [address, setAddress] = useState(
    "0x1234567890123456789012345678901234567890",
  )

  return <AddressBook address={address} onAddressChange={setAddress} />
}
