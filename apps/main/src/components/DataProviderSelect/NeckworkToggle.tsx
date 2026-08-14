import { ToggleGroup, ToggleGroupItem } from "@galacticcouncil/ui/components"

import { useNeckworkEnabled, useNeckworkStore } from "@/states/neckwork"

type Source = "neckwork" | "squid"

export const NeckworkToggle = () => {
  const neckworkEnabled = useNeckworkEnabled()
  const setOverride = useNeckworkStore((state) => state.setOverride)

  return (
    <ToggleGroup<Source>
      type="single"
      size="small"
      value={neckworkEnabled ? "neckwork" : "squid"}
      onValueChange={(value) => value && setOverride(value === "neckwork")}
    >
      <ToggleGroupItem value="neckwork">Neckwork</ToggleGroupItem>
      <ToggleGroupItem value="squid">Squid</ToggleGroupItem>
    </ToggleGroup>
  )
}
