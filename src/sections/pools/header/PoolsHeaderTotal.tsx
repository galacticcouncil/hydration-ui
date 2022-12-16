import { Heading } from "components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { Text } from "components/Typography/Text/Text"
import {
  useTotalInPools,
  useUsersTotalInPools,
} from "sections/pools/header/PoolsHeaderTotal.utils"
import BN from "bignumber.js"

type Props = { myPositions: boolean; variant: "pools" | "farms" }

export const PoolsHeaderTotal = ({ myPositions, variant }: Props) => {
  if (myPositions && variant === "pools") {
    return <PoolsHeaderTotalPoolsUser />
  }
  if (!myPositions && variant === "pools") {
    return <PoolsHeaderTotalPools />
  }
  if (myPositions && variant === "farms") {
    return <PoolsHeaderTotalFarmsUser />
  }
  if (!myPositions && variant === "farms") {
    return <PoolsHeaderTotalFarms />
  }
  return null
}

const PoolsHeaderTotalData = ({
  value,
  isLoading,
}: {
  value: BN | undefined
  isLoading: boolean
}) => {
  const { t } = useTranslation()

  return (
    <Heading as="h3" sx={{ fontSize: [16, 42], fontWeight: 500 }}>
      {!isLoading && !!value ? (
        <>
          <Text
            font="ChakraPetch"
            fw={900}
            fs={[19, 42]}
            sx={{ display: "inline-block" }}
          >
            $
          </Text>
          {t("value", {
            value,
            type: "dollar",
          })}
        </>
      ) : (
        <Skeleton width={256} />
      )}
    </Heading>
  )
}

const PoolsHeaderTotalPools = () => {
  const { data, isLoading } = useTotalInPools()
  return <PoolsHeaderTotalData value={data} isLoading={isLoading} />
}

const PoolsHeaderTotalPoolsUser = () => {
  const { data, isLoading } = useUsersTotalInPools()
  return <PoolsHeaderTotalData value={data} isLoading={isLoading} />
}

const PoolsHeaderTotalFarms = () => {
  return (
    <Heading as="h3" sx={{ fontSize: [16, 42], fontWeight: 500 }}>
      TODO
    </Heading>
  )
}

const PoolsHeaderTotalFarmsUser = () => {
  return (
    <Heading as="h3" sx={{ fontSize: [16, 42], fontWeight: 500 }}>
      TODO
    </Heading>
  )
}
