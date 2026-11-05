import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  Button,
  Flex,
  Icon,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { useTranslation } from "react-i18next"

import { DepositBalanceRow } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { toDecimal } from "@/utils/formatting"

type DepositDiscoveredAssetProps = {
  row: DepositBalanceRow
  onClick: () => void
}

export const DepositDiscoveredAsset: React.FC<DepositDiscoveredAssetProps> = ({
  row,
  onClick,
}) => {
  const { t } = useTranslation("common")
  const { source, balance, value } = row
  return (
    <Button
      variant="transparent"
      onClick={onClick}
      width="100%"
      py="m"
      px="l"
      sx={{
        height: "auto",
        flexShrink: 0,
        whiteSpace: "normal",
        justifyContent: "space-between",
        textAlign: "left",
      }}
    >
      <Flex gap="base" align="center" minWidth={0}>
        <XAssetLogo asset={balance} chain={source.chain} />
        <Stack gap="s" minWidth={0}>
          <Text fs="p3" fw={600}>
            {balance.originSymbol}
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {source.chain.name}
          </Text>
          <Flex gap="s" align="center">
            <AccountAvatar address={source.account.displayAddress} size={12} />
            <Text fs="p6" truncate color={getToken("text.low")}>
              {source.account.name} ·{" "}
              {getWallet(source.account.provider)?.title}
            </Text>
          </Flex>
        </Stack>
      </Flex>
      <Flex align="center" gap="base">
        <Stack gap="s" align="flex-end">
          <Text fs="p4" fw={500}>
            {t("number", {
              value: toDecimal(balance.amount, balance.decimals),
            })}
          </Text>
          <Text fs="p5" color={getToken("text.low")}>
            {value === undefined ? "—" : t("currency", { value })}
          </Text>
        </Stack>
        <Icon component={ChevronRight} size="m" />
      </Flex>
    </Button>
  )
}
