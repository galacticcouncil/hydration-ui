import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { PoolIncentivesRow } from "sections/pools/pool/incentives/row/PoolIncentivesRow"
import { useAPR } from "utils/apr"

type Props = { poolId: string }

export const PoolIncentives = ({ poolId }: Props) => {
  const { t } = useTranslation()

  const { data } = useAPR(poolId)

  return (
    <div sx={{ width: 256 }}>
      <Text fs={14} lh={26} color="neutralGray400" sx={{ mb: 18 }}>
        {t("pools.pool.incentives.title")}
      </Text>
      {data.map((row, i) => (
        <PoolIncentivesRow key={i} assetId={row.assetId} apr={row.apr} />
      ))}
    </div>
  )
}
