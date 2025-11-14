import { Button, Flex, Input } from "@galacticcouncil/ui/components"
import { Search } from "lucide-react"
import { FC } from "react"

type Props = {
  readonly canAdd: boolean
  readonly searchPhrase: string
  readonly onSearchPhraseChange: (searchPhrase: string) => void
  readonly onAdd: () => void
}

export const AddressBookSearch: FC<Props> = ({
  canAdd,
  searchPhrase,
  onSearchPhraseChange,
  onAdd,
}) => {
  return (
    <Flex align="center" gap={10} position="relative">
      <Input
        sx={{ flex: 1 }}
        customSize="large"
        iconStart={Search}
        placeholder="Search or paste address to add"
        value={searchPhrase}
        onChange={(e) => onSearchPhraseChange(e.target.value)}
      />
      {canAdd && (
        <Button
          sx={{ position: "absolute" }}
          right={20}
          top="50%"
          transform="translateY(-50%)"
          variant="secondary"
          size="small"
          onClick={onAdd}
        >
          Add
        </Button>
      )}
    </Flex>
  )
}
