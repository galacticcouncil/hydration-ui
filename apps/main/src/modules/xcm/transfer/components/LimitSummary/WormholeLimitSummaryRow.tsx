import {
  Flex,
  SummaryRow,
  SummaryRowLabel,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import { WormholeLimitInfo } from "@/modules/xcm/transfer/components/LimitSummary/WormholeLimitInfo"
import type { NttRateLimit } from "@/modules/xcm/transfer/utils/limits"
import { toDecimal } from "@/utils/formatting"

type WormholeLimitSummaryRowProps = {
  outbound: NttRateLimit | undefined
  inbound: NttRateLimit | undefined
  bindingLeg: "outbound" | "inbound"
  srcChain: AnyChain
  destChain: AnyChain
  srcAsset: Asset
  destAsset: Asset
  loading?: boolean
}

export const WormholeLimitSummaryRow = ({
  outbound,
  inbound,
  bindingLeg,
  srcChain,
  destChain,
  srcAsset,
  destAsset,
  loading,
}: WormholeLimitSummaryRowProps) => {
  const { t } = useTranslation(["common", "xcm"])

  const isInbound = bindingLeg === "inbound"
  const limit = isInbound ? inbound : outbound
  const asset = isInbound ? destAsset : srcAsset
  const decimals =
    (isInbound
      ? destChain.getAssetDecimals(destAsset)
      : srcChain.getAssetDecimals(srcAsset)) ?? 0

  if (!limit) return null

  return (
    <SummaryRow
      sx={{ my: 0 }}
      label={
        <SummaryRowLabel fw={500} color={getToken("text.high")}>
          {t(`xcm:summary.wormholeLimit.${bindingLeg}`)}:
        </SummaryRowLabel>
      }
      loading={loading}
      content={
        <Tooltip
          text={
            <WormholeLimitInfo
              leg={bindingLeg}
              outbound={outbound}
              inbound={inbound}
              srcChain={srcChain}
              destChain={destChain}
              srcAsset={srcAsset}
              destAsset={destAsset}
            />
          }
          asChild
        >
          <Flex align="center" gap="xs" asChild>
            <Text fs="p5" fw={600} color={getToken("text.high")}>
              {t("currency.compact", {
                value: toDecimal(limit.capacity, decimals),
                symbol: asset.originSymbol,
              })}
              <TooltipIcon />
            </Text>
          </Flex>
        </Tooltip>
      }
    />
  )
}
