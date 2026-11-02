import {
  Flex,
  Stack,
  SummaryRow,
  SummaryRowLabel,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import { BasejumpPoolLiquidity } from "@/modules/xcm/transfer/utils/limits"
import { toDecimal } from "@/utils/formatting"

type BasejumpPoolSummaryRowProps = {
  pool: BasejumpPoolLiquidity
  destChain: AnyChain
  destAsset: Asset
  loading?: boolean
}

export const BasejumpPoolSummaryRow = ({
  pool,
  destChain,
  destAsset,
  loading,
}: BasejumpPoolSummaryRowProps) => {
  const { t } = useTranslation(["common", "xcm"])

  const symbol = destAsset.originSymbol
  const available = toDecimal(pool.available, pool.decimals)

  return (
    <SummaryRow
      sx={{ my: 0 }}
      label={
        <SummaryRowLabel fw={500} color={getToken("text.high")}>
          {t("xcm:summary.basejumpPool")}:
        </SummaryRowLabel>
      }
      loading={loading}
      content={
        <Tooltip
          text={
            <Stack gap="xs">
              <Text fs="p5" fw={600}>
                {t("xcm:limit.basejump.pool.title")}
              </Text>
              <Text fs="p5" fw={600} color={getToken("text.tint.secondary")}>
                {t("number", { value: available })} {symbol}
              </Text>
              <Text fs="p6" lh={1.3}>
                {t("xcm:limit.basejump.pool.description", {
                  chainName: destChain.name,
                })}
              </Text>
            </Stack>
          }
          asChild
        >
          <Flex align="center" gap="xs" asChild>
            <Text fs="p5" fw={600} color={getToken("text.high")}>
              {t("currency", { value: available, symbol })}
              <TooltipIcon />
            </Text>
          </Flex>
        </Tooltip>
      }
    />
  )
}
