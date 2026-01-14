import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Input, Label } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC, useId } from "react"
import { useTranslation } from "react-i18next"

import { TabMenu } from "@/components/TabMenu"
import { walletAssetFiltersItems } from "@/modules/wallet/assets/WalletAssetFilters.items"

type Props = {
  readonly searchPhrase: string
  readonly onSearchPhraseChange: (searchPhrase: string) => void
}

export const WalletAssetFiltersDesktop: FC<Props> = ({
  searchPhrase,
  onSearchPhraseChange,
}) => {
  const inputId = useId()
  const { t } = useTranslation()

  return (
    <Flex
      pt={getTokenPx("containers.paddings.tertiary")}
      align="flex-end"
      justify="space-between"
    >
      <TabMenu items={walletAssetFiltersItems} />
      <Input
        id={inputId}
        value={searchPhrase}
        placeholder={t("search.placeholder.assets")}
        leadingElement={
          <Label asChild htmlFor={inputId}>
            <Icon
              as="label"
              sx={{ cursor: "text" }}
              size={18}
              component={Search}
              mr={8}
            />
          </Label>
        }
        onChange={(e) => onSearchPhraseChange(e.target.value)}
      />
    </Flex>
  )
}
