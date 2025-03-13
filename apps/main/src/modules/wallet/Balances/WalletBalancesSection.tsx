import { Separator } from "@galacticcouncil/ui/components"
import { ValueStats } from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"

export const WalletBalancesSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const [liquidity] = useDisplayAssetPrice("10", 10301874)
  const [borrow] = useDisplayAssetPrice("10", 10301874)
  const [supply] = useDisplayAssetPrice("10", 10301874)
  const [inFarms] = useDisplayAssetPrice("10", 1245)

  return (
    <Flex py={20} direction="column" justify="space-between">
      <ValueStats
        size="small"
        label={t("balances.header.liquidity")}
        value={liquidity}
        bottomLabel={t("balances.header.inFarms", {
          price: inFarms,
        })}
      />
      <Separator />
      <ValueStats
        size="small"
        label={t("balances.header.liquidity")}
        value={liquidity}
        bottomLabel={t("balances.header.inFarms", {
          price: inFarms,
        })}
      />
      <Separator />
      <ValueStats
        size="small"
        label={t("balances.header.borrow")}
        value={borrow}
      />
      <Separator />
      <ValueStats
        size="small"
        label={t("balances.header.supply")}
        value={supply}
      />
    </Flex>
  )
}
