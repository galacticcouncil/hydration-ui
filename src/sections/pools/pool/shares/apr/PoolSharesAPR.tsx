import { FC, useMemo } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAPR } from "utils/apr"

type Props = { poolId: string }

export const PoolSharesApr: FC<Props> = ({ poolId }) => {
  const { t } = useTranslation()

  const APRs = useAPR(poolId)
  const sortedAPR = useMemo(() => {
    if (!APRs.data) return undefined

    return APRs.data.sort((a, b) => a.apr.minus(b.apr).toNumber())
  }, [APRs.data])

  return (
    <div sx={{ flex: "row", justify: "end" }}>
      <div sx={{ flex: "column", gap: 6 }}>
        <Text fs={12} lh={16} fw={400} color="neutralGray500">
          {t("pools.pool.liquidity.apr.title")}
        </Text>
        {!!sortedAPR?.length && (
          <Text fs={14} lh={18} color="white">
            {sortedAPR.length > 1
              ? t("pools.pool.liquidity.apr.value", {
                  min: sortedAPR[0].apr,
                  max: sortedAPR[sortedAPR.length - 1].apr,
                })
              : t("value.APR", { apr: sortedAPR[0].apr })}
          </Text>
        )}
      </div>
    </div>
  )
}
