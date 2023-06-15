import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { theme } from "theme"
import BN from "bignumber.js"

type PieTotalValueProps = {
  title: string
  data: BN
  isLoading: boolean
}

export const PieTotalValue = ({
  title,
  data,
  isLoading,
}: PieTotalValueProps) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  if (isLoading) return <Skeleton width={200} height={isDesktop ? 42 : 20} />

  return (
    <div sx={{ flex: "column", gap: 8 }}>
      <Text color="brightBlue300">{title}</Text>
      <div sx={{ flex: "row", align: "baseline", gap: 4 }}>
        <Text fs={[20, 42]} font="ChakraPetch" fw={900}>
          $
        </Text>
        <Text fs={[20, 42]} font="FontOver">
          {t("value.usd", { amount: data, numberPrefix: "" })}
        </Text>
      </div>
    </div>
  )
}
