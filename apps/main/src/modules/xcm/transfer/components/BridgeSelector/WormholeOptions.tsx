import {
  Flex,
  Toggle,
  ToggleLabel,
  ToggleRoot,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
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
    <ToggleRoot justify="space-between" align="center">
      <Flex asChild align="center" gap="s">
        <ToggleLabel>
          {t("wormhole.autoClaim")}
          <Tooltip
            text={t("wormhole.autoClaim.tooltip")}
            iconColor={getToken("icons.onContainer")}
          />
        </ToggleLabel>
      </Flex>
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
