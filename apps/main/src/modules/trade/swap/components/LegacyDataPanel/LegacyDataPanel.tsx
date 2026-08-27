import {
  Paper,
  Separator,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"

import { SquidIndexerStatus } from "@/components/DataProviderSelect/components/squid/SquidIndexerStatus"

type LegacyDataPanelProps = {
  isIndexerDegraded: boolean
  isUsingLegacyData: boolean
  onLegacyDataChange: (enabled: boolean) => void
}

export const LegacyDataPanel = ({
  isIndexerDegraded,
  isUsingLegacyData,
  onLegacyDataChange,
}: LegacyDataPanelProps) => (
  <Paper p="xl" maxWidth="4xl">
    <ToggleRoot>
      <ToggleLabel>Legacy Data</ToggleLabel>
      <Toggle
        sx={{ ml: "auto" }}
        disabled={isIndexerDegraded}
        checked={isUsingLegacyData}
        onCheckedChange={onLegacyDataChange}
      />
    </ToggleRoot>
    <Separator my="l" />
    <SquidIndexerStatus sx={{ fontSize: "p5" }} />
  </Paper>
)
