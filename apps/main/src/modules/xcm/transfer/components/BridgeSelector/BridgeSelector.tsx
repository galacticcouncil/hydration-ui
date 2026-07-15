import { OptionCard, Stack } from "@galacticcouncil/ui/components"
import { AssetRoute } from "@galacticcouncil/xc-core"
import { useFormContext } from "react-hook-form"

import { SnowbridgeOptions } from "@/modules/xcm/transfer/components/BridgeSelector/SnowbridgeOptions"
import {
  BridgeEntryKind,
  useBridgeOptions,
} from "@/modules/xcm/transfer/hooks/useBridgeOptions"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { BRIDGE_ICON, BRIDGE_TIME } from "@/modules/xcm/transfer/utils/bridge"

type BridgeSelectorProps = {
  routes: AssetRoute[]
}

export const BridgeSelector: React.FC<BridgeSelectorProps> = ({ routes }) => {
  const { watch, setValue } = useFormContext<XcmFormValues>()
  const [destAsset, bridgeProvider] = watch(["destAsset", "bridgeProvider"])

  const { options, hasVisibleOptions } = useBridgeOptions(routes, destAsset)

  if (!hasVisibleOptions) return null

  const handleSelect = (id: string) => {
    setValue("bridgeProvider", id)
  }

  return (
    <Stack gap="base">
      {options.map((entry) => {
        switch (entry.kind) {
          case BridgeEntryKind.Default:
            return (
              <OptionCard
                key={entry.tag}
                label={entry.tag}
                value={BRIDGE_TIME[entry.tag] ?? ""}
                icon={BRIDGE_ICON[entry.tag]}
                isActive={bridgeProvider === entry.tag}
                onClick={() => handleSelect(entry.tag)}
              />
            )
          case BridgeEntryKind.Snowbridge:
            return (
              <SnowbridgeOptions
                key={BridgeEntryKind.Snowbridge}
                activeProvider={bridgeProvider ?? null}
                hasV2={!!entry.v2}
                hasV1={!!entry.v1}
                onSelect={handleSelect}
              />
            )
        }
      })}
    </Stack>
  )
}
