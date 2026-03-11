import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AssetRoute } from "@galacticcouncil/xc-core"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getPrimaryBridgeTag } from "@/modules/xcm/transfer/utils/transfer"
import { XcmTag } from "@/states/transactions"

import { SBridgeOption, SParticle } from "./BridgeSelector.styled"

const BRIDGE_TIME_ESTIMATES: Partial<Record<string, string>> = {
  [XcmTag.InstaBridge]: "~42 sec",
  [XcmTag.Wormhole]: "~18 min",
  [XcmTag.Snowbridge]: "~25 min",
}

// Particle animation durations — ratio matches real-world transfer times
// Base Jumper: 42 sec, Wormhole: 18 min (1080 sec) → ~25.7× slower
const BRIDGE_PARTICLE_DURATION: Partial<Record<string, string[]>> = {
  [XcmTag.InstaBridge]: ["0.9s", "0.9s", "0.9s"], // 3 staggered packets = rapid stream
  [XcmTag.Wormhole]: ["23s"],
  [XcmTag.Snowbridge]: ["36s"],
}

const BRIDGE_PARTICLE_COLOR: Partial<Record<string, string>> = {
  [XcmTag.InstaBridge]: "#4fc4f9",
  [XcmTag.Wormhole]: "#a78bfa",
  [XcmTag.Snowbridge]: "#60a5fa",
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
        durations: BRIDGE_PARTICLE_DURATION[tag] ?? ["5s"],
        color: BRIDGE_PARTICLE_COLOR[tag] ?? "#ffffff",
      }
    })
    .filter(Boolean) as {
    id: string
    label: string
    time?: string
    durations: string[]
    color: string
  }[]

  if (options.length < 2) return null

  return (
    <Flex direction="column" gap="base">
      {options.map((option) => {
        const active = bridgeProvider === option.id
        const count = option.durations.length
        return (
          <SBridgeOption
            key={option.id}
            type="button"
            active={active}
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
            {option.durations.map((duration, i) => (
              <SParticle
                key={i}
                color={option.color}
                duration={duration}
                delay={`${(i / count) * parseFloat(duration)}s`}
                active={active}
              />
            ))}
          </SBridgeOption>
        )
      })}
    </Flex>
  )
}
