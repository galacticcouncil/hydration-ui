import { useTranslation } from "react-i18next"
import { PoolBase } from "@galacticcouncil/sdk"
import { Button } from "components/Button/Button"
import { useAccountStore } from "state/store"
import { DepositNftType } from "api/deposits"
import { AprFarm } from "utils/farms/apr"
import { useRedepositMutation } from "utils/farms/redeposit"

type Props = {
  pool: PoolBase
  availableYieldFarms: AprFarm[]
  depositNfts: DepositNftType[]
}

export const PoolFarmRedeposit = (props: Props) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const redeposit = useRedepositMutation(
    props.pool,
    props.availableYieldFarms,
    props.depositNfts,
  )

  if (!account) return null

  return (
    <Button
      variant="primary"
      disabled={redeposit.isLoading}
      onClick={() => redeposit.mutate()}
      sx={{ width: "100%" }}
    >
      {t("farms.redeposit.submit")}
    </Button>
  )
}
