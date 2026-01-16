import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Input,
  Label,
  Select,
  SelectItem,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useNavigate } from "@tanstack/react-router"
import { FC, useId, useState } from "react"
import { useTranslation } from "react-i18next"

import { walletAssetFiltersItems } from "@/modules/wallet/assets/WalletAssetFilters.items"
import { WalletAssetsCategory } from "@/routes/wallet/assets"

type Props = {
  readonly category: WalletAssetsCategory
  readonly searchPhrase: string
  readonly onSearchPhraseChange: (searchPhrase: string) => void
}

export const WalletAssetFiltersMobile: FC<Props> = ({
  category,
  searchPhrase,
  onSearchPhraseChange,
}) => {
  const inputId = useId()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const selectItems = walletAssetFiltersItems.map<SelectItem<string>>(
    (item) => ({
      key: item.search.category,
      label: item.title,
    }),
  )

  return (
    <Flex
      pt={getTokenPx("containers.paddings.tertiary")}
      justify="space-between"
    >
      {!isSearchExpanded && (
        <Select
          items={selectItems}
          value={category}
          onValueChange={(category) => {
            const item = walletAssetFiltersItems.find(
              (item) => item.search.category === category,
            )

            if (item) {
              navigate({
                to: item.to,
                search: item.search,
                resetScroll: item.resetScroll,
              })
            }
          }}
        />
      )}
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
              size={18}
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
