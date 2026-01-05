import { Toggle, ToggleLabel, ToggleRoot } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly showAllAssets: boolean
  readonly onToggleShowAllAssets: () => void
}

export const MyAssetsActions: FC<Props> = ({
  showAllAssets,
  onToggleShowAllAssets,
}) => {
  const { t } = useTranslation("wallet")

  return (
    <ToggleRoot>
      <ToggleLabel>{t("myAssets.header.toggle")}</ToggleLabel>
      <Toggle checked={showAllAssets} onCheckedChange={onToggleShowAllAssets} />
    </ToggleRoot>
  )
}
