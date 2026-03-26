import { Text } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { TAsset } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

export type MarketSellAllAlertProps = {
  asset: TAsset
}

export const MarketSellAllAlert: React.FC<MarketSellAllAlertProps> = ({
  asset,
}) => {
  const { t } = useTranslation()

  const { getBalance } = useAccountBalances()
  const balance = getBalance(asset.id)

  return (
    <Text fs="p4" lh={1.3} fw={600}>
      {t("transaction.alert.sellAll", {
        value: balance ? scaleHuman(balance.transferable, asset.decimals) : "",
        symbol: asset.symbol,
      })}
    </Text>
  )
}
