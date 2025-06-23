import { NotebookTabs } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

type Props = {
  readonly canAdd: boolean
}

export const AddressBookEmptyState = ({ canAdd }: Props) => {
  return (
    <Flex
      direction="column"
      align="center"
      color={getToken("text.medium")}
      py={56}
    >
      <Icon component={NotebookTabs} size={40} mb={16} />
      <Text fw={500}>This address is not on your list.</Text>
      {canAdd && <Text fw={500}>Click Add to add it to your contacts.</Text>}
    </Flex>
  )
}
