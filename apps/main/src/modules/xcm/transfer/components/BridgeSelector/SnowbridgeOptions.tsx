import {
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { XcmTag } from "@/states/transactions"

enum SnowbridgeVersion {
  V2 = "v2",
  V1 = "v1",
}

type SnowbridgeOptionsProps = {
  activeProvider: string | null
  hasV2: boolean
  hasV1: boolean
  onSelect: (id: string) => void
}

export const SnowbridgeOptions: React.FC<SnowbridgeOptionsProps> = ({
  activeProvider,
  hasV2,
  hasV1,
  onSelect,
}) => {
  const { t } = useTranslation(["xcm", "common"])

  const version =
    activeProvider === XcmTag.SnowbridgeV1
      ? SnowbridgeVersion.V1
      : SnowbridgeVersion.V2

  const handleVersionChange = (next: SnowbridgeVersion) => {
    if (next === version) return
    onSelect(
      next === SnowbridgeVersion.V1 ? XcmTag.SnowbridgeV1 : XcmTag.Snowbridge,
    )
  }

  return (
    <Stack gap="base">
      {hasV2 && hasV1 && (
        <ToggleGroup<SnowbridgeVersion>
          type="single"
          value={version}
          onValueChange={(value) => value && handleVersionChange(value)}
        >
          <ToggleGroupItem value={SnowbridgeVersion.V2}>
            {t("snowbridge.version.v2")}
          </ToggleGroupItem>
          <ToggleGroupItem value={SnowbridgeVersion.V1}>
            {t("snowbridge.version.v1")}
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </Stack>
  )
}
