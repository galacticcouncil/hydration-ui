import { NotebookTabs } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import i18n from "@/i18n"

type Props = {
  readonly canAdd: boolean
}

export const AddressBookEmptyState = ({ canAdd }: Props) => {
  const { t } = useTranslation("translations", { i18n })
  return (
    <Flex
      direction="column"
      align="center"
      color={getToken("text.medium")}
      py={56}
    >
      <Icon component={NotebookTabs} size={40} mb={16} />
      <Text fw={500}>{t("addressBook.emptyState")}</Text>
      {canAdd && <Text fw={500}>{t("addressBook.emptyStateAdd")}</Text>}
    </Flex>
  )
}
