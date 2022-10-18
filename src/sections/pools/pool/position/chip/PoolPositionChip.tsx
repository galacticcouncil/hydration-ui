import { useAccountDepositIds, useDeposits } from "api/deposits"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { SChip } from "./PoolPositionChip.styled"

type PositionChipProps = { poolId: string }

const PositionChip = ({ poolId }: PositionChipProps) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const deposits = useDeposits(poolId)
  const accountDepositIds = useAccountDepositIds(account?.address)
  const positions = deposits.data?.filter((deposit) =>
    accountDepositIds.data?.some((ad) => ad.instanceId.eq(deposit.id)),
  )

  if (!positions?.length) {
    return null
  }

  return (
    <SChip>
      {t("pools.pool.positions.amount", { count: positions?.length })}
    </SChip>
  )
}

export default PositionChip
