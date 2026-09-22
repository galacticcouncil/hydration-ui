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

import { toDecimal } from "@/utils/formatting"

type WormholeCustodySummaryRowProps = {
  custody: bigint
  destChain: AnyChain
  destAsset: Asset
  loading?: boolean
}

/**
 * What a locking ntt manager on the destination can still release -
 * everything above it strands until more of the asset is bridged back.
 */
export const WormholeCustodySummaryRow = ({
  custody,
  destChain,
  destAsset,
  loading,
}: WormholeCustodySummaryRowProps) => {
  const { t } = useTranslation(["common", "xcm"])

  const decimals = destChain.getAssetDecimals(destAsset) ?? 0
  const symbol = destAsset.originSymbol

  return (
    <SummaryRow
      sx={{ my: 0 }}
      label={
        <SummaryRowLabel fw={500} color={getToken("text.high")}>
          {t("xcm:summary.wormholeCustody", { chainName: destChain.name })}:
        </SummaryRowLabel>
      }
      loading={loading}
      content={
        <Tooltip
          text={
            <Stack gap="xs">
              <Text fs="p5" fw={600}>
                {t("xcm:limit.wormhole.custody.title", {
                  chainName: destChain.name,
                })}
              </Text>
              <Text fs="p5" fw={600} color={getToken("text.tint.secondary")}>
                {t("number.compact", {
                  value: toDecimal(custody, decimals),
                })}{" "}
                {symbol}
              </Text>
              <Text fs="p6" lh={1.3}>
                {t("xcm:limit.wormhole.custody.description", {
                  chainName: destChain.name,
                  symbol,
                })}
              </Text>
            </Stack>
          }
          asChild
        >
          <Flex align="center" gap="xs" asChild>
            <Text fs="p5" fw={600} color={getToken("text.high")}>
              {t("currency.compact", {
                value: toDecimal(custody, decimals),
                symbol,
              })}
              <TooltipIcon />
            </Text>
          </Flex>
        </Tooltip>
      }
    />
  )
}
