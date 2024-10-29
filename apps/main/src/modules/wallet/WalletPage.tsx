import { useSuspenseQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { postsQuery } from "@/api/posts"

export const WalletPage = () => {
  const { t } = useTranslation(["common", "wallet"])

  const { data } = useSuspenseQuery(postsQuery)

  return (
    <div>
      <h1>{t("wallet:title")}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
