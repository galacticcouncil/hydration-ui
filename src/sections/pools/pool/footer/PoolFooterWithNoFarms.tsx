import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useUsersTotalInPool } from "sections/pools/pool/footer/PoolFooter.utils"
import { SContainer } from "./PoolFooter.styled"

type Props = { pool: OmnipoolPool }

export const PoolFooterWithNoFarms = ({ pool }: Props) => {
  const { t } = useTranslation()

  const locked = useUsersTotalInPool(pool)

  if ((!locked.data || locked.data.isZero()) && !locked.isLoading) return null

  return (
    <SContainer>
      <div>
        <Text fs={16}>
          {locked.isLoading ? (
            <Skeleton width={90} />
          ) : (
            <Trans t={t} i18nKey="liquidity.asset.claim.total">
              <DisplayValue value={locked.data} />
            </Trans>
          )}
        </Text>
      </div>
    </SContainer>
  )
}
