import {
  Flex,
  Paper,
  ProgressBar,
  Separator,
  Skeleton,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const PoolDetailsValuesSkeleton = () => {
  const { t } = useTranslation("liquidity")

  return (
    <Paper
      as={Flex}
      width={360}
      p={[16, 20]}
      sx={{
        flex: 0,
        flexBasis: 360,
        flexDirection: "column",
      }}
      gap="xl"
    >
      <Flex direction="column">
        <Text
          font="primary"
          fw={700}
          fs="p3"
          lh="130%"
          color={getToken("text.tint.secondary")}
          sx={{ pb: "xl" }}
        >
          {t("details.values.liquidityLimit")}
        </Text>

        <ProgressBar
          value={0}
          size="large"
          orientation="vertical"
          customLabel={<Skeleton width={100} />}
        />
      </Flex>

      <Separator mx={-20} />

      <ValueStats label={t("details.values.volume")} value="0" isLoading wrap />

      <Separator mx={-20} />

      <ValueStats label={t("totalValueLocked")} value="0" isLoading wrap />

      <Separator mx={-20} />

      <ValueStats
        label={t("details.values.feeFarmApr")}
        value="0"
        isLoading
        wrap
      />

      <Separator mx={-20} />

      <ValueStats
        label={t("details.values.omnipoolShare")}
        value="0"
        isLoading={true}
        wrap
      />
    </Paper>
  )
}
