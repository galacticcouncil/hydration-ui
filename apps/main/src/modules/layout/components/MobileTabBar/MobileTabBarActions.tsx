import {
  QuestionCircleRegular,
  Settings,
} from "@galacticcouncil/ui/assets/icons"
import { Grid, Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { MobileTabBarDrawer } from "@/modules/layout/components/MobileTabBar/MobileTabBar"
import { MobileTabBarAction } from "@/modules/layout/components/MobileTabBar/MobileTabBarAction"

type Props = {
  readonly onOpenDrawer: (drawer: MobileTabBarDrawer) => void
}

export const MobileTabBarActions: FC<Props> = ({ onOpenDrawer }) => {
  const { t } = useTranslation()

  return (
    <Grid gap={4} sx={{ gridTemplateColumns: "1fr auto 1fr" }}>
      <MobileTabBarAction
        icon={Settings}
        label={t("settings")}
        onClick={() => onOpenDrawer(MobileTabBarDrawer.Settings)}
      />
      <Separator orientation="vertical" />
      <MobileTabBarAction icon={QuestionCircleRegular} label={t("docs")} />
    </Grid>
  )
}
