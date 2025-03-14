import { Search, Settings } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Grid, Input, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components"
import { SubpageMenu } from "@/components/SubpageMenu/SubpageMenu"
import { WalletAssets } from "@/modules/wallet/WalletAssets"
import { WalletBalances } from "@/modules/wallet/WalletBalances"
import { WalletLiquidity } from "@/modules/wallet/WalletLiquidity"
import { WalletRewards } from "@/modules/wallet/WalletRewards"

export const WalletAssetsPage = () => {
  const { t } = useTranslation("wallet")
  const [search, setSearch] = useState("")

  const { category } = useSearch({
    from: "/_wallet/wallet/assets",
  })

  return (
    <Flex direction="column" gap={20}>
      <Grid height={345} gap={20} sx={{ gridTemplateColumns: "2fr 1fr" }}>
        <WalletBalances />
        <WalletRewards />
      </Grid>
      <Input
        customSize="large"
        placeholder="Search..."
        iconStart={Search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Flex pt={12} gap={16} align="flex-end" justify="space-between">
        <SubpageMenu
          items={[
            { to: "/wallet/assets?category=all", title: "All" },
            {
              to: "/wallet/assets?category=assets",
              title: "Assets",
            },
            {
              to: "/wallet/assets?category=liquidity",
              title: "Liquidity",
            },
          ]}
        />
        <Flex gap={8.5} align="center">
          <Text fs="p4" fw={500} color={getToken("text.medium")}>
            {t("feePaymentAssets")}
          </Text>
          <Flex gap={4} align="center">
            <Logo id="0" />
            <Text fs="p3" fw={500} color={getToken("text.high")}>
              HDX
            </Text>
          </Flex>
          <Button
            variant="tertiary"
            outline
            size="medium"
            iconStart={Settings}
          />
        </Flex>
      </Flex>
      {(category === "all" || category === "assets") && (
        <WalletAssets search={search} />
      )}
      {(category === "all" || category === "liquidity") && (
        <WalletLiquidity search={search} />
      )}
    </Flex>
  )
}
