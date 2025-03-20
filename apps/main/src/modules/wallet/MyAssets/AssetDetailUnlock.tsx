import { Button } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const AssetDetailUnlock: FC = () => {
  const { t } = useTranslation(["wallet"])

  return (
    <Button variant="accent" outline>
      {t("myAssets.expandedNative.actions.unlockAvailableAssets")}
    </Button>
  )
}
