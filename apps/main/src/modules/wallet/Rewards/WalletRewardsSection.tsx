import {
  Button,
  Grid,
  Separator,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"

export const WalletRewardsSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const [totalRewards] = useDisplayAssetPrice("10", 14143000)

  return (
    <Grid
      p={20}
      borderRadius={16}
      align="center"
      sx={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: getToken("details.separators"),
        gridTemplateColumns: "1fr auto",
      }}
    >
      <ValueStats
        size="medium"
        label={t("rewards.allocated")}
        value={`${t("common:number", { value: 200000 })} HDX`}
      />
      <Separator sx={{ gridColumn: "1/-1" }} />
      <Grid
        sx={{ gridColumn: "1/-1", gridTemplateColumns: "subgrid" }}
        align="center"
      >
        <ValueStats
          size="medium"
          label={t("rewards.claimable")}
          value={`${t("common:number", { value: 15000 })} HDX`}
        />
        <Button size="medium" variant="tertiary">
          {t("rewards.goToStaking")}
        </Button>
      </Grid>
      <Separator sx={{ gridColumn: "1/-1" }} />
      <Grid
        sx={{ gridColumn: "1/-1", gridTemplateColumns: "subgrid" }}
        align="center"
      >
        <ValueStats
          size="medium"
          label={t("rewards.total")}
          value={totalRewards}
        />
        <Button size="medium">{t("common:claim")}</Button>
      </Grid>
    </Grid>
  )
}
