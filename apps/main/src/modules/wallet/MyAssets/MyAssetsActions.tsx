import { Add } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
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
    <Flex gap={16} align="center">
      <Button size="medium" iconStart={Add}>
        {t("myAssets.header.cta")}
      </Button>
      <ToggleRoot>
        <ToggleLabel>{t("myAssets.header.toggle")}</ToggleLabel>
        <Toggle
          checked={showAllAssets}
          onCheckedChange={onToggleShowAllAssets}
        />
      </ToggleRoot>
    </Flex>
  )
}
