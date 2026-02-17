import { Button, Flex, Input } from "@galacticcouncil/ui/components"
import { Search } from "lucide-react"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import i18n from "@/i18n"

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
  const { t } = useTranslation("translations", { i18n })
  return (
    <Flex align="center" gap="base" position="relative">
      <Input
        sx={{ flex: 1 }}
        customSize="large"
        iconStart={Search}
        placeholder={t("addressBook.searchPlaceholder")}
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
          {t("addressBook.add")}
        </Button>
      )}
    </Flex>
  )
}
