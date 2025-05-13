import { MoneyMarketProvider } from "@galacticcouncil/money-market/components"
import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { SubpageLayout } from "@/modules/layout/SubpageLayout"

const Page = () => {
  const { t } = useTranslation(["common"])
  return (
    <MoneyMarketProvider
      formatCurrency={(value, options) =>
        t("currency", {
          value,
          ...options,
        })
      }
      formatNumber={(value, options) =>
        t("number", {
          value,
          ...options,
        })
      }
      formatPercent={(value, options) =>
        t("percent", {
          value,
          ...options,
        })
      }
    >
      <SubpageLayout />
    </MoneyMarketProvider>
  )
}

export const Route = createFileRoute("/_borrow/borrow")({
  component: Page,
})
