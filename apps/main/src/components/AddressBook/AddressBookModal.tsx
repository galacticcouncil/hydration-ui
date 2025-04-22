import { Flex, Input } from "@galacticcouncil/ui/components"
import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import { Web3ConnectAccount } from "@galacticcouncil/web3-connect/src/components/Web3ConnectAccount"
import { Search } from "lucide-react"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly onBack?: () => void
  readonly onSelect: (address: string) => void
}

export const AddressBookModal: FC<Props> = ({ onBack, onSelect }) => {
  const { t } = useTranslation()
  const [searchPhrase, setSearchPhrase] = useState("")

  const accounts = useWeb3Connect((s) => s.accounts)
  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchPhrase.toLowerCase()) ||
      account.address.toLowerCase().includes(searchPhrase.toLowerCase()),
  )

  return (
    <>
      <ModalHeader title={t("addressBook.modal.title")} onBack={onBack} />
      <ModalBody sx={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Input
          iconStart={Search}
          placeholder={t("addressBook.modal.placeholder")}
          value={searchPhrase}
          onChange={(e) => setSearchPhrase(e.target.value)}
        />
        <Flex direction="column" gap={10}>
          {filteredAccounts.map((account) => (
            <Web3ConnectAccount
              key={account.address}
              {...account}
              onSelect={() => onSelect(account.address)}
            />
          ))}
        </Flex>
      </ModalBody>
    </>
  )
}
