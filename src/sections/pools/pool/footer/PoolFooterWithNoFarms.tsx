import { SContainer } from "./PoolFooter.styled"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { useUsersTotalInPool } from "sections/pools/pool/footer/PoolFooter.utils"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import Skeleton from "react-loading-skeleton"

type Props = { pool: OmnipoolPool }

export const PoolFooterWithNoFarms = ({ pool }: Props) => {
  const { t } = useTranslation()

  const locked = useUsersTotalInPool(pool)

  if (!locked.data || locked.data.isZero() || !locked.isLoading) return null

  return (
    <SContainer>
      <div>
        <Text fs={16}>
          {locked.isLoading ? (
            <Skeleton />
          ) : (
            t("liquidity.asset.claim.total", { locked: locked.data })
          )}
        </Text>
      </div>
    </SContainer>
  )
}
