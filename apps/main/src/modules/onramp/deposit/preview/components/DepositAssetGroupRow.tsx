import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Chip,
  Flex,
  Icon,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DepositAssetGroup } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"

type DepositAssetGroupRowProps = {
  group: DepositAssetGroup
  onClick: () => void
}

export const DepositAssetGroupRow: FC<DepositAssetGroupRowProps> = ({
  group,
  onClick,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const first = group.rows[0]!
  const chains = [
    ...new Set(group.rows.map((row) => row.source.chain.name)),
  ].join(", ")
  const wallets = [
    ...new Set(
      group.rows
        .map((row) => getWallet(row.source.account.provider)?.title)
        .filter(Boolean),
    ),
  ].join(", ")
  return (
    <Button
      variant="ghost"
      width="100%"
      onClick={onClick}
      sx={{
        borderRadius: "m",
        px: "m",
        py: "base",
        display: "flex",
        height: "auto",
        whiteSpace: "normal",
        textAlign: "left",
      }}
    >
      <Flex gap="m" align="center" justify="space-between" width="100%">
        <Flex gap="m" align="center" minWidth={0}>
          <XAssetLogo asset={first.balance} chain={first.source.chain} />
          <Stack gap="s" minWidth={0} justify="flex-start">
            <Text fs="p3" fw={600}>
              {group.symbol}
            </Text>
            <Text fs="p5" color={getToken("text.medium")}>
              {t("common:currency", {
                value: group.amount,
                symbol: group.symbol,
              })}
            </Text>
            <Text fs="p6" color={getToken("text.low")}>
              {chains}
              {wallets ? ` · ${wallets}` : ""}
            </Text>
            {(group.routeCount > 1 || group.claimPossible) && (
              <Flex gap="s" wrap>
                {group.routeCount > 1 && (
                  <Chip size="small" variant="blue">
                    {t("deposit.v3.assets.routeCount", {
                      count: group.routeCount,
                    })}
                  </Chip>
                )}
                {group.claimPossible && (
                  <Chip size="small" variant="amber">
                    {t(
                      group.claimRequired
                        ? "deposit.v3.assets.claimRequired"
                        : "deposit.v3.assets.claimPossible",
                    )}
                  </Chip>
                )}
              </Flex>
            )}
          </Stack>
        </Flex>
        <Flex gap="base" align="center">
          <Text fs="p4" fw={500}>
            {group.value === undefined
              ? "—"
              : t("common:currency", { value: group.value })}
          </Text>
          <Icon component={ChevronRight} size="m" />
        </Flex>
      </Flex>
    </Button>
  )
}
