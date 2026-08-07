import { Toggle, ToggleLabel, ToggleRoot } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { XcmTag } from "@/states/transactions"

type WormholeOptionsProps = {
  activeProvider: string | null
  onSelect: (id: string) => void
}

export const WormholeOptions: React.FC<WormholeOptionsProps> = ({
  activeProvider,
  onSelect,
}) => {
  const { t } = useTranslation("xcm")

  return (
    <ToggleRoot justify="space-between" px="m">
      <ToggleLabel>{t("wormhole.autoClaim")}</ToggleLabel>
      <Toggle
        name="wormholeAutoClaim"
        checked={activeProvider === XcmTag.NttExecutor}
        onCheckedChange={(checked) =>
          onSelect(checked ? XcmTag.NttExecutor : XcmTag.Wormhole)
        }
      />
    </ToggleRoot>
  )
}
