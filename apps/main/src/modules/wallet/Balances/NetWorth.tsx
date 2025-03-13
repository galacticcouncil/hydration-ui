import { ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"

export const NetWorth: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const [netWorth] = useDisplayAssetPrice("10", 10301874)

  return (
    <div>
      <ValueStats
        size="medium"
        label={t("balances.header.netWorth")}
        value={netWorth}
      />
      {/* Graph placeholder */}
      <div />
    </div>
  )
}
