import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Input, Label } from "@galacticcouncil/ui/components"
import { FC, useId, useState } from "react"
import { useTranslation } from "react-i18next"

import { WalletAssetsCategory } from "@/routes/wallet/assets"

type Props = {
  readonly category: WalletAssetsCategory
  readonly searchPhrase: string
  readonly onSearchPhraseChange: (searchPhrase: string) => void
}

export const WalletAssetFiltersMobile: FC<Props> = ({
  searchPhrase,
  onSearchPhraseChange,
}) => {
  const inputId = useId()
  const { t } = useTranslation()

  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  return (
    <Flex pt="m" justify="flex-end">
      <Input
        id={inputId}
        sx={{ width: isSearchExpanded ? "100%" : 42 }}
        value={searchPhrase}
        placeholder={
          isSearchExpanded ? t("search.placeholder.assets") : undefined
        }
        autoFocus={isSearchExpanded}
        leadingElement={
          <Label asChild htmlFor={inputId}>
            <Icon
              as="label"
              sx={{ cursor: "text", flexShrink: 0 }}
              size="m"
              component={Search}
              mr={isSearchExpanded ? 8 : 0}
            />
          </Label>
        }
        onChange={(e) => onSearchPhraseChange(e.target.value)}
        onFocus={() => setIsSearchExpanded(true)}
        onBlur={() => setIsSearchExpanded(false)}
      />
    </Flex>
  )
}
