import {
  Button,
  Flex,
  Grid,
  HeaderInfo,
  SectionHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useFormattedAssetPrice } from "@/components/AssetPrice/AssetPrice"
export const WalletRewards: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const [totalRewards] = useFormattedAssetPrice("10", 14143000)

  return (
    <Grid sx={{ gridTemplateRows: "auto 1fr" }}>
      <SectionHeader>{t("rewards.title")}</SectionHeader>
      <Flex
        p={20}
        direction="column"
        justify="space-between"
        borderRadius={16}
        sx={{
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: getToken("details.separators"),
        }}
      >
        <HeaderInfo
          size="medium"
          label={t("rewards.allocated")}
          value={`${t("common:number", { value: 200000 })} HDX`}
        />
        <Separator />
        <Flex justify="space-between" align="center">
          <HeaderInfo
            size="medium"
            label={t("rewards.claimable")}
            value={`${t("common:number", { value: 15000 })} HDX`}
          />
          <Button size="medium" variant="tertiary">
            {t("rewards.goToStaking")}
          </Button>
        </Flex>
        <Separator />
        <Flex justify="space-between" align="center">
          <HeaderInfo
            size="medium"
            label={t("rewards.total")}
            value={totalRewards}
          />
          <Button size="medium">{t("common:claim")}</Button>
        </Flex>
      </Flex>
    </Grid>
  )
}
