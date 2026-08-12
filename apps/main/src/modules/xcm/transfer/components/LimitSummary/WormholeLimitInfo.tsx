import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import {
  isNttMetered,
  type NttRateLimit,
} from "@/modules/xcm/transfer/utils/limits"
import { toDecimal } from "@/utils/formatting"

export type WormholeLimitInfoProps = {
  leg: "outbound" | "inbound"
  outbound: NttRateLimit | undefined
  inbound: NttRateLimit | undefined
  srcChain: AnyChain
  destChain: AnyChain
  srcAsset: Asset
  destAsset: Asset
}

export const WormholeLimitInfo: React.FC<WormholeLimitInfoProps> = ({
  leg,
  outbound,
  inbound,
  srcChain,
  destChain,
  srcAsset,
  destAsset,
}) => {
  const { t } = useTranslation(["common", "xcm"])

  const isInbound = leg === "inbound"
  const limit = isInbound ? inbound : outbound
  const chain = isInbound ? destChain : srcChain
  const asset = isInbound ? destAsset : srcAsset
  const decimals = chain.getAssetDecimals(asset) ?? 0

  if (!limit || !isNttMetered(limit)) return null

  return (
    <Stack gap="base">
      <Text fs="p5">
        {t("xcm:limit.wormhole.description", { period: limit.windowMs })}
      </Text>

      <Stack gap="xs">
        <Text fs="p5" fw={600}>
          {t(`xcm:limit.wormhole.${leg}.title`, {
            chainName: chain.name,
          })}
        </Text>
        <Text fs="p5" fw={600} color={getToken("text.tint.secondary")}>
          {t("number.compact", {
            value: toDecimal(limit.capacity, decimals),
          })}
          {" / "}
          {t("number.compact", {
            value: toDecimal(limit.limit, decimals),
          })}{" "}
          {asset.originSymbol}
        </Text>
        <Text fs="p6" lh={1.3}>
          {t(`xcm:limit.wormhole.${leg}.description`)}
        </Text>
      </Stack>
    </Stack>
  )
}
