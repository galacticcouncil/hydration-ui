import { Close } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  Button,
  ButtonIcon,
  Flex,
  Grid,
  Icon,
  Input,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { ArrowDownToLine, BookOpen } from "lucide-react"
import { FC } from "react"

import { useAddressStore } from "@/components/address-book/AddressBook.store"
import { SAddressBook } from "@/components/address-book/AddressBook.styled"
import { TALISMAN_PROVIDERS } from "@/config/providers"

export type AddressBookProps = {
  readonly address: string
  readonly isError?: boolean
  readonly onAddressChange: (address: string) => void
  readonly onOpenMyContacts: () => void
}

export const AddressBook: FC<AddressBookProps> = ({
  address,
  isError,
  onAddressChange,
  onOpenMyContacts,
}) => {
  const { addresses } = useAddressStore()
  const provider = addresses.find((a) => a.address === address)?.provider
  const isTalisman = !!provider && TALISMAN_PROVIDERS.includes(provider)

  return (
    <SAddressBook>
      <Flex justify="space-between" align="center">
        <Text fw={500} fs="p5" lh={1.2} color={getToken("text.medium")}>
          Destination address
        </Text>
        <Button
          variant="accent"
          outline
          size="small"
          sx={{ textTransform: "uppercase" }}
          onClick={onOpenMyContacts}
        >
          My contacts
          <BookOpen />
        </Button>
      </Flex>
      <Grid columnTemplate="1fr auto" align="center" columnGap={10}>
        <Flex align="center" gap={getTokenPx("containers.paddings.quart")}>
          <AccountAvatar
            address={address}
            theme={isTalisman ? "talisman" : "auto"}
          />
          <Input
            variant="embedded"
            sx={{ p: 0, flex: 1 }}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Paste address here..."
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
    </SAddressBook>
  )
}
