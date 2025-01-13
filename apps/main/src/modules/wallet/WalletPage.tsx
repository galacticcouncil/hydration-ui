import { Text } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { postsQuery } from "@/api/posts"

export const WalletPage = () => {
  const { t } = useTranslation(["common", "wallet"])

  const { data } = useQuery(postsQuery)

  return (
    <div>
      <Text as="h4" fs={40} fw={600} font="primary">
        {t("wallet:title")}
      </Text>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
