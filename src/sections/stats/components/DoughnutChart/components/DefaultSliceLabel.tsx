import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { TSlice } from "sections/stats/components/DoughnutChart/DoughnutChart"
import { useMedia } from "react-use"
import { theme } from "theme"

export const DefaultSliceLabel = ({ slices }: { slices: TSlice[] }) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { t } = useTranslation()

  const sortedSlices = [...slices].sort((a, b) => b.percentage - a.percentage)

  return (
    <motion.div
      sx={{ flex: "column", align: "center" }}
      css={{ position: "absolute" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div sx={{ flex: "column", align: "center", gap: 6 }}>
        <MultipleIcons
          size={[20, 36]}
          icons={[
            { icon: getAssetLogo(sortedSlices[0]?.symbol) },
            { icon: getAssetLogo(sortedSlices[1]?.symbol) },
            { icon: getAssetLogo(sortedSlices[2]?.symbol) },
          ]}
        />
        <Text color="basic100" fs={[12, 18]}>
          {t("stats.overview.pie.defaultLabel.composition")}
        </Text>
        <Text color="basic100" fs={[10, 12]}>
          {t("stats.overview.pie.defaultLabel.assetAvailable", {
            amount: slices.length,
          })}
        </Text>
      </div>
      <motion.div
        initial={{ opacity: 0, y: isDesktop ? -40 : -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Text
          color="darkBlue300"
          fs={[10, 12]}
          css={{ position: "relative", bottom: isDesktop ? -35 : -10 }}
        >
          {t("stats.overview.pie.defaultLabel.hover")}
        </Text>
      </motion.div>
    </motion.div>
  )
}
