import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useTotalInPools } from "sections/pools/header/PoolsHeaderTotal.utils"
import { useTotalVolumesInPools } from "sections/pools/header/PoolsHeaderVolume.utils"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { useTotalPolValue } from "./PieTotalValue.utils"
import { useMedia } from "react-use"
import { theme } from "theme"
import { EmotionJSX } from "@emotion/react/types/jsx-namespace"

type PieTotalValueProps = {
  title: string
  type: "tvl" | "volume" | "pol"
}

export const PieTotalValue = ({ title, type }: PieTotalValueProps) => {
  const api = useApiPromise()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const isApi = isApiLoaded(api)

  const skeleton = <Skeleton width={200} height={isDesktop ? 42 : 20} />

  let data = skeleton

  if (isApi) {
    if (type === "tvl") {
      data = <TVLValue skeleton={skeleton} />
    }

    if (type === "volume") {
      data = <VolumeValue skeleton={skeleton} />
    }

    if (type === "pol") {
      data = <POLValue skeleton={skeleton} />
    }
  }

  return (
    <div sx={{ flex: "column", gap: 8 }}>
      <Text color="brightBlue300">{title}</Text>
      {data}
    </div>
  )
}

const TVLValue = ({ skeleton }: { skeleton: EmotionJSX.Element }) => {
  const { data, isLoading } = useTotalInPools()
  const { t } = useTranslation()

  if (isLoading) return skeleton

  return (
    <div sx={{ flex: "row", align: "baseline", gap: 4 }}>
      <Text fs={[20, 42]} font="ChakraPetch" fw={900}>
        $
      </Text>
      <Text fs={[20, 42]} font="FontOver">
        {t("value.usd", { amount: data, numberPrefix: "" })}
      </Text>
    </div>
  )
}

const POLValue = ({ skeleton }: { skeleton: EmotionJSX.Element }) => {
  const { t } = useTranslation()
  const { data: totalData, isLoading } = useTotalPolValue()

  if (isLoading) return skeleton

  return (
    <div sx={{ flex: "row", align: "baseline", gap: 4 }}>
      <Text fs={[20, 42]} font="ChakraPetch" fw={900}>
        $
      </Text>
      <Text fs={[20, 42]} font="FontOver">
        {t("value.usd", { amount: totalData, numberPrefix: "" })}
      </Text>
    </div>
  )
}

const VolumeValue = ({ skeleton }: { skeleton: EmotionJSX.Element }) => {
  const { value, isLoading } = useTotalVolumesInPools()
  const { t } = useTranslation()

  if (isLoading) return skeleton

  return (
    <div sx={{ flex: "row", align: "baseline", gap: 4 }}>
      <Text fs={[20, 42]} font="ChakraPetch" fw={900}>
        $
      </Text>
      <Text fs={[20, 42]} font="FontOver">
        {t("value.usd", { amount: value, numberPrefix: "" })}
      </Text>
    </div>
  )
}
