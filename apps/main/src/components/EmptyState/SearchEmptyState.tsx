import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly searchPhrase: string
}

export const SearchEmptyState: FC<Props> = ({ searchPhrase }) => {
  const { t } = useTranslation("common")

  return (
    <Text color={getToken("text.medium")} fs="p5" lh={1.3} py="xl">
      {t("search.emptyState")}{" "}
      <Text as="span" fw={600} color={getToken("text.high")}>
        &ldquo;{searchPhrase}&rdquo;
      </Text>
    </Text>
  )
}
