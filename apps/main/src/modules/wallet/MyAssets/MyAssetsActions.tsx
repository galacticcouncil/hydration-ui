import { Add } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

export const MyAssetsActions: FC = () => {
  const { t } = useTranslation("wallet")

  const [showAllAssets, setShowAllAssets] = useState(false)

  return (
    <Flex gap={16} align="center">
      <Button size="medium" iconStart={Add}>
        {t("myAssets.header.cta")}
      </Button>
      <ToggleRoot>
        <ToggleLabel>{t("myAssets.header.toggle")}</ToggleLabel>
        <Toggle
          checked={showAllAssets}
          onCheckedChange={() => setShowAllAssets(!showAllAssets)}
        />
      </ToggleRoot>
    </Flex>
  )
}
