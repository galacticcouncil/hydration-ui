import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"

import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { PoolIncentivesRow } from "sections/pools/pool/incentives/row/PoolIncentivesRow"
import { useAPR } from "utils/apr"
import { MultiplePoolIncentivesRow } from "./row/MultiplePoolIncentivesRow/MultiplePoolIncentivesRow"

type PoolIncentivesProps = { poolId: string }

export const PoolIncentives = ({ poolId }: PoolIncentivesProps) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { data } = useAPR(poolId)

  return (
    <div sx={{ width: ["auto", 256] }}>
      <Text
        fs={14}
        lh={26}
        fw={400}
        color="neutralGray400"
        sx={{ mb: [0, 18] }}
      >
        {t("pools.pool.incentives.title")}
      </Text>
      {isDesktop ? (
        data.map((row, i) => (
          <PoolIncentivesRow key={i} assetId={row.assetId} apr={row.apr} />
        ))
      ) : (
        <MultiplePoolIncentivesRow farms={data} />
      )}
    </div>
  )
}
