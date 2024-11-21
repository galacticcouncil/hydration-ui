import { Text } from "@galacticcouncil/ui/components"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { postsQuery } from "@/api/posts"

export const WalletPage = () => {
  const { t } = useTranslation(["common", "wallet"])

  const { data } = useSuspenseQuery(postsQuery)

  return (
    <div>
      <Text as="h4" fs={40} fw={600} font="Primary-Font">
        {t("wallet:title")}
      </Text>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
