import {
  Flex,
  Grid,
  HeaderInfo,
  SectionHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useFormattedAssetPrice } from "@/components"
import { WalletBalancesContainer } from "@/modules/wallet/WalletBalances.styled"

export const WalletBalances: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const [liquidity] = useFormattedAssetPrice("10", 10301874)
  const [borrow] = useFormattedAssetPrice("10", 10301874)
  const [supply] = useFormattedAssetPrice("10", 10301874)
  const [inFarms] = useFormattedAssetPrice("10", 1245)
  const [netWorth] = useFormattedAssetPrice("10", 10301874)

  return (
    <Grid sx={{ gridTemplateRows: "auto 1fr" }}>
      <SectionHeader>{t("balances.title")}</SectionHeader>
      <WalletBalancesContainer>
        <div>
          <HeaderInfo
            size="medium"
            label={t("balances.header.netWorth")}
            value={netWorth}
          />
          <div sx={{ width: 500 }} />
        </div>
        <Separator orientation="vertical" />
        <Flex py={20} direction="column" justify="space-between">
          <HeaderInfo
            size="small"
            label={t("balances.header.liquidity")}
            value={liquidity}
            bottomLabel={t("balances.header.inFarms", {
              price: inFarms,
            })}
          />
          <Separator />
          <HeaderInfo
            size="small"
            label={t("balances.header.liquidity")}
            value={liquidity}
            bottomLabel={t("balances.header.inFarms", {
              price: inFarms,
            })}
          />
          <Separator />
          <HeaderInfo
            size="small"
            label={t("balances.header.borrow")}
            value={borrow}
          />
          <Separator />
          <HeaderInfo
            size="small"
            label={t("balances.header.supply")}
            value={supply}
          />
        </Flex>
      </WalletBalancesContainer>
    </Grid>
  )
}
