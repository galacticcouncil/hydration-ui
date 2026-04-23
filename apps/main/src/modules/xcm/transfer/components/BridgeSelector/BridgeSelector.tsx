import { Basejumper } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AssetRoute } from "@galacticcouncil/xc-core"
import { useFormContext } from "react-hook-form"
import { isNonNullish } from "remeda"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getPrimaryBridgeTag } from "@/modules/xcm/transfer/utils/transfer"
import { XcmTag } from "@/states/transactions"

import { SBridgeOption } from "./BridgeSelector.styled"

type BridgeOption = {
  id: string
  label: string
  time: string
}

const BRIDGE_PRIORITY: Record<string, number> = {
  [XcmTag.Basejump]: 0,
  [XcmTag.Wormhole]: 1,
  [XcmTag.Snowbridge]: 2,
}

const BRIDGE_TIME_ESTIMATES: Partial<Record<string, string>> = {
  [XcmTag.Basejump]: "~22 sec",
  [XcmTag.Wormhole]: "~30 min",
  [XcmTag.Snowbridge]: "~25 min",
}

type BridgeSelectorProps = {
  routes: AssetRoute[]
}

export const BridgeSelector: React.FC<BridgeSelectorProps> = ({ routes }) => {
  const { watch, setValue } = useFormContext<XcmFormValues>()
  const bridgeProvider = watch("bridgeProvider")

  const options = routes
    .map((route) => {
      const tag = getPrimaryBridgeTag(route)
      if (!tag) return null
      return {
        id: tag,
        label: tag,
        time: BRIDGE_TIME_ESTIMATES[tag] ?? "",
      } satisfies BridgeOption
    })
    .filter(isNonNullish)
    .sort(
      (a, b) => (BRIDGE_PRIORITY[a.id] ?? 99) - (BRIDGE_PRIORITY[b.id] ?? 99),
    )

  if (options.length < 2) return null

  return (
    <Flex direction="column" gap="base">
      {options.map((option) => {
        const active = bridgeProvider === option.id
        return (
          <SBridgeOption
            key={option.id}
            type="button"
            active={active}
            onClick={() => setValue("bridgeProvider", option.id)}
          >
            <Flex gap="s" align="center">
              {option.id === XcmTag.Basejump && (
                <Icon
                  component={Basejumper}
                  size="xl"
                  sx={{ transform: "scale(1.8)" }}
                  color={getToken("text.medium")}
                />
              )}
              <Text fs="p3" lh={1} color={getToken("text.high")}>
                {option.label}
              </Text>
            </Flex>
            <Text fs="p5" fw={600} color={getToken("text.high")}>
              {option.time}
            </Text>
          </SBridgeOption>
        )
      })}
    </Flex>
  )
}
