import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { useMedia } from "react-use"
import { theme } from "theme"

export const PieLabel = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { t } = useTranslation()

  return (
    <motion.div
      sx={{ flex: "column", align: "center" }}
      css={{ position: "absolute" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div sx={{ flex: "column", align: "center", gap: 6 }}>
        {getAssetLogo("LRNA")}
        <Text color="basic100" fs={[12, 18]}>
          LRNA Distribution
          {/*{t("stats.overview.pie.defaultLabel.composition")}*/}
        </Text>
        <Text color="basic100" fs={[10, 12]}>
          In/Outside of Omnipool
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
