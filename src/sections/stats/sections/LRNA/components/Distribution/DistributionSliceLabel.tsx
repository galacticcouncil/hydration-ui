import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

type SliceLabelProps = {
  symbol?: string
  percentage: number
  text: string
}

export const DistributionSliceLabel = ({
  percentage,
  symbol,
  text,
}: SliceLabelProps) => {
  const { t } = useTranslation()

  return (
    <motion.div
      sx={{ flex: "column", align: "center", gap: 6 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon size={[20, 36]} icon={<AssetLogo id="1" />} />
      <Text color="basic100" fs={[20, 34]}>
        {t("value.percentage", { value: percentage })}
      </Text>
      <Text color="basic100" fs={[10, 20]}>
        {symbol}
      </Text>
      <Text color="basic100" fs={[10, 12]}>
        {text}
      </Text>
    </motion.div>
  )
}
