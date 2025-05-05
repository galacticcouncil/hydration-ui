import { Close, IdenticonEmpty } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  Button,
  ButtonIcon,
  Flex,
  Grid,
  Icon,
  Input,
  Modal,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import { ArrowDownToLine, BookOpen } from "lucide-react"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { SAddressBook } from "@/components/AddressBook/AddressBook.styled"
import { AddressBookModal } from "@/components/AddressBook/AddressBookModal"

export type AddressBookProps = {
  readonly address: string
  readonly isError?: boolean
  readonly onAddressChange: (address: string) => void
  readonly onOpenMyContacts?: () => void
}

export const AddressBook: FC<AddressBookProps> = ({
  address,
  isError,
  onAddressChange,
  onOpenMyContacts,
}) => {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const account = useWeb3Connect((s) =>
    s.accounts.find((account) => account.address === address),
  )

  return (
    <SAddressBook>
      <Flex justify="space-between" align="center">
        <Text fw={500} fs="p5" lh={1.2} color={getToken("text.medium")}>
          {t("addressBook.label")}
        </Text>
        <Button
          variant="accent"
          outline
          size="small"
          iconEnd={BookOpen}
          sx={{ textTransform: "uppercase" }}
          onClick={
            onOpenMyContacts ? onOpenMyContacts : () => setIsModalOpen(true)
          }
        >
          {t("addressBook.myContacts")}
        </Button>
      </Flex>
      <Grid columnTemplate="1fr auto" align="center" columnGap={10}>
        <Flex align="center" gap={getTokenPx("containers.paddings.quart")}>
          {account ? (
            <AccountAvatar address={account.address} />
          ) : (
            <IdenticonEmpty />
          )}
          <Input
            variant="embedded"
            sx={{ p: 0, flex: 1 }}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder={t("addressBook.placeholder")}
            isError={isError}
          />
        </Flex>
        {!address ? (
          <ButtonIcon
            onClick={async () => {
              const text = await navigator.clipboard.readText()
              onAddressChange(text)
            }}
          >
            <Icon component={ArrowDownToLine} size={18} />
          </ButtonIcon>
        ) : (
          <ButtonIcon onClick={() => onAddressChange("")}>
            <Icon component={Close} size={18} />
          </ButtonIcon>
        )}
      </Grid>
      <Modal open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <AddressBookModal
          onSelect={(address) => {
            onAddressChange(address)
            setIsModalOpen(false)
          }}
        />
      </Modal>
    </SAddressBook>
  )
}
