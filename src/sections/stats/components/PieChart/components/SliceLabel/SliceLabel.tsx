import BigNumber from "bignumber.js"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Text } from "components/Typography/Text/Text"
import { motion } from "framer-motion"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"

type SliceLabelProps = {
  symbol: string
  percentage: number
  value: BigNumber
  id: string
}

export const SliceLabel = ({
  symbol,
  percentage,
  value,
  id,
}: SliceLabelProps) => {
  const { t } = useTranslation()

  const { assets } = useRpcProvider()

  const meta = assets.getAsset(id)
  const iconIds = assets.isStableSwap(meta) ? meta.assets : meta.id

  return (
    <motion.div
      sx={{ flex: "column", align: "center", gap: 6 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {typeof iconIds === "string" ? (
        <Icon size={[20, 36]} icon={<AssetLogo id={iconIds} />} />
      ) : (
        <MultipleIcons
          size={[20, 36]}
          icons={iconIds.map((id) => ({
            icon: <AssetLogo key={id} id={id} />,
          }))}
        />
      )}
      <Text color="basic100" fs={[20, 34]}>
        {t("value.percentage", { value: percentage })}
      </Text>
      <Text color="basic100" fs={[10, 20]}>
        <DisplayValue value={value} isUSD />
      </Text>
      <Text color="basic100" fs={[10, 20]}>
        {symbol}
      </Text>
    </motion.div>
  )
}
