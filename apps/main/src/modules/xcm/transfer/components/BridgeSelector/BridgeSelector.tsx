import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AssetRoute } from "@galacticcouncil/xc-core"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getPrimaryBridgeTag } from "@/modules/xcm/transfer/utils/transfer"
import { XcmTag } from "@/states/transactions"

import { SBridgeOption } from "./BridgeSelector.styled"

const BRIDGE_TIME_ESTIMATES: Partial<Record<string, string>> = {
  [XcmTag.InstaBridge]: "~42 sec",
  [XcmTag.Wormhole]: "~18 min",
  [XcmTag.Snowbridge]: "~25 min",
}

type BridgeSelectorProps = {
  routes: AssetRoute[]
}

export const BridgeSelector: React.FC<BridgeSelectorProps> = ({ routes }) => {
  const { t } = useTranslation(["xcm"])
  const { watch, setValue } = useFormContext<XcmFormValues>()
  const bridgeProvider = watch("bridgeProvider")

  const options = routes
    .map((route) => {
      const tag = getPrimaryBridgeTag(route)
      if (!tag) return null
      return {
        id: tag,
        label: t(`xcm:bridge.provider.${tag.toLowerCase()}`, tag),
        time: BRIDGE_TIME_ESTIMATES[tag],
      }
    })
    .filter(Boolean) as { id: string; label: string; time?: string }[]

  if (options.length < 2) return null

  return (
    <Flex direction="column" gap="base">
      {options.map((option) => (
        <SBridgeOption
          key={option.id}
          type="button"
          active={bridgeProvider === option.id}
          onClick={() => setValue("bridgeProvider", option.id)}
        >
          <Text fs="p3" lh={1} color={getToken("text.high")}>
            {option.label}
          </Text>
          {option.time && (
            <Text fs="p5" color={getToken("text.medium")}>
              {option.time}
            </Text>
          )}
        </SBridgeOption>
      ))}
    </Flex>
  )
}
