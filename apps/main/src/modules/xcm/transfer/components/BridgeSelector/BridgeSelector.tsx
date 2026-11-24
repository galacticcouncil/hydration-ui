import { OptionCard, Stack } from "@galacticcouncil/ui/components"
import { AssetRoute } from "@galacticcouncil/xc-core"
import { useFormContext } from "react-hook-form"

import { WormholeOptions } from "@/modules/xcm/transfer/components/BridgeSelector/WormholeOptions"
import {
  BridgeEntryKind,
  useBridgeOptions,
} from "@/modules/xcm/transfer/hooks/useBridgeOptions"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import {
  BRIDGE_ICON,
  BRIDGE_LABEL,
  BRIDGE_TIME,
} from "@/modules/xcm/transfer/utils/bridge"
import { XcmTag } from "@/states/transactions"

type BridgeSelectorProps = {
  routes: AssetRoute[]
}

export const BridgeSelector: React.FC<BridgeSelectorProps> = ({ routes }) => {
  const { watch, setValue } = useFormContext<XcmFormValues>()
  const bridgeProvider = watch("bridgeProvider")

  const { options, hasVisibleOptions } = useBridgeOptions(routes)

  if (!hasVisibleOptions) return null

  const handleSelect = (id: string) => {
    setValue("bridgeProvider", id)
  }

  const isWormholeOnlyOption = options.length === 1
  const isWormholeActive =
    bridgeProvider === XcmTag.NttExecutor || bridgeProvider === XcmTag.Wormhole

  return (
    <Stack gap="base">
      {options.map((entry) => {
        switch (entry.kind) {
          case BridgeEntryKind.Default:
            return (
              <OptionCard
                key={entry.tag}
                label={BRIDGE_LABEL[entry.tag] ?? entry.tag}
                value={BRIDGE_TIME[entry.tag] ?? ""}
                icon={BRIDGE_ICON[entry.tag]}
                isActive={bridgeProvider === entry.tag}
                onClick={() => handleSelect(entry.tag)}
              />
            )
          case BridgeEntryKind.Wormhole:
            return (
              <Stack key={BridgeEntryKind.Wormhole} gap="base">
                {!isWormholeOnlyOption && (
                  <OptionCard
                    label={
                      BRIDGE_LABEL[XcmTag.NttExecutor] ?? XcmTag.NttExecutor
                    }
                    value={BRIDGE_TIME[XcmTag.NttExecutor] ?? ""}
                    icon={BRIDGE_ICON[XcmTag.NttExecutor]}
                    isActive={isWormholeActive}
                    onClick={() => handleSelect(XcmTag.NttExecutor)}
                  />
                )}
                {(isWormholeOnlyOption || isWormholeActive) && (
                  <WormholeOptions
                    activeProvider={bridgeProvider ?? null}
                    onSelect={handleSelect}
                  />
                )}
              </Stack>
            )
        }
      })}
    </Stack>
  )
}
