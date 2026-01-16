import {
  Flex,
  Grid,
  SectionHeader,
  Separator,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { NetWorth } from "@/modules/wallet/assets/Balances/NetWorth"
import { useWalletBalancesSectionData } from "@/modules/wallet/assets/Balances/WalletBalances.data"
import { SWalletBalances } from "@/modules/wallet/assets/Balances/WalletBalances.styled"

export const WalletBalances: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const {
    assets,
    isAssetsLoading,
    liquidity,
    farms,
    isLiquidityLoading,
    borrow,
    isBorrowLoading,
  } = useWalletBalancesSectionData()

  return (
    <Grid rowTemplate="auto 1fr">
      <SectionHeader title={t("balances.title")} />
      <SWalletBalances>
        <NetWorth
          assetBalance={assets}
          liquidityBalance={liquidity}
          borrowed={borrow}
          isCurrentLoading={
            isAssetsLoading || isLiquidityLoading || isBorrowLoading
          }
        />
        <Separator
          mt={8}
          orientation="vertical"
          display={["none", null, "initial"]}
        />
        <Separator mt={8} display={["initial", null, "none"]} />
        <Flex direction="column" gap={[20, 10]}>
          <ValueStats
            size="small"
            wrap={[false, false, true]}
            label={t("balances.header.assets")}
            value={t("common:currency", { value: assets })}
            bottomLabel={t("balances.header.assets.borrowed", {
              amount: t("common:currency", { value: borrow }),
            })}
            isLoading={isAssetsLoading || isBorrowLoading}
          />
          <Separator />
          <ValueStats
            size="small"
            wrap={[false, false, true]}
            label={t("balances.header.liquidity")}
            value={t("common:currency", { value: liquidity })}
            bottomLabel={t("balances.header.liquidity.farming", {
              amount: t("common:currency", { value: farms }),
            })}
            isLoading={isLiquidityLoading}
          />
        </Flex>
      </SWalletBalances>
    </Grid>
  )
}
