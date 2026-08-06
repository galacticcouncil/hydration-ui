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
  outbound: NttRateLimit | undefined
  inbound: NttRateLimit | undefined
  srcChain: AnyChain
  destChain: AnyChain
  srcAsset: Asset
  destAsset: Asset
}

export const WormholeLimitInfo: React.FC<WormholeLimitInfoProps> = ({
  outbound,
  inbound,
  srcChain,
  destChain,
  srcAsset,
  destAsset,
}) => {
  const { t } = useTranslation(["common", "xcm"])

  const srcDecimals = srcChain.getAssetDecimals(srcAsset) ?? 0
  const destDecimals = destChain.getAssetDecimals(destAsset) ?? 0

  return (
    <Stack gap="base">
      <Text fs="p5">{t("xcm:limit.wormhole.description")}</Text>

      {outbound && isNttMetered(outbound) && (
        <Stack gap="xs">
          <Text fs="p5" fw={600}>
            {t("xcm:limit.wormhole.outbound.title", {
              chainName: srcChain.name,
            })}
          </Text>
          <Text fs="p5" fw={600} color={getToken("text.tint.secondary")}>
            {t("number.compact", {
              value: toDecimal(outbound.capacity, srcDecimals),
            })}
            {" / "}
            {t("number.compact", {
              value: toDecimal(outbound.limit, srcDecimals),
            })}{" "}
            {srcAsset.originSymbol}
          </Text>
          <Text fs="p6" lh={1.3}>
            {t("xcm:limit.wormhole.outbound.description")}
          </Text>
        </Stack>
      )}

      {inbound && isNttMetered(inbound) && (
        <Stack gap="xs">
          <Text fs="p5" fw={600}>
            {t("xcm:limit.wormhole.inbound.title", {
              chainName: destChain.name,
            })}
          </Text>
          <Text fs="p5" fw={600} color={getToken("text.tint.secondary")}>
            {t("number.compact", {
              value: toDecimal(inbound.capacity, destDecimals),
            })}
            {" / "}
            {t("number.compact", {
              value: toDecimal(inbound.limit, destDecimals),
            })}{" "}
            {destAsset.originSymbol}
          </Text>
          <Text fs="p6" lh={1.3}>
            {t("xcm:limit.wormhole.inbound.description")}
          </Text>
        </Stack>
      )}
    </Stack>
  )
}
