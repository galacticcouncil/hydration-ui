import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { PoolBase } from "@galacticcouncil/sdk"
import { getTradeFee } from "sections/pools/pool/Pool.utils"
import { Icon } from "components/Icon/Icon"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { PoolFarmJoin } from "sections/pools/farm/modals/join/PoolFarmJoin"
import { useState } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { PoolFarmPositionDetail } from "sections/pools/farm/modals/positionDetail/PoolFarmPositionDetail"
import { useAccountDepositIds, useDeposits } from "api/deposits"
import { useAccountStore } from "state/store"

export function PoolDetailsTradeFee(props: { pool: PoolBase }) {
  const { t } = useTranslation()

  const [openFarms, setOpenFarms] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const { account } = useAccountStore()
  const deposits = useDeposits(props.pool.address)
  const accountDepositIds = useAccountDepositIds(account?.address)
  const positions = deposits.data?.filter((deposit) =>
    accountDepositIds.data?.some((ad) => ad.instanceId.eq(deposit.id)),
  )

  return (
    <>
      <div
        sx={{ flex: "row", align: "center" }}
        onClick={() => !isDesktop && setOpenFarms(true)}
      >
        <div sx={{ flex: "column", justify: "center", width: ["auto", 120] }}>
          <Text fs={14} fw={400} color="neutralGray400" lh={26}>
            {t("pools.pool.poolDetails.fee")}
          </Text>
          <Text lh={22} color="white" tAlign={["right", "left"]}>
            {t("value.percentage", { value: getTradeFee(props.pool.tradeFee) })}
          </Text>
        </div>
        <Icon
          icon={<ChevronRight />}
          sx={{
            ml: 11,
            mt: 6,
            color: "primary300",
            display: ["inherit", "none"],
          }}
          size={36}
        />
      </div>

      {!positions?.length ? (
        <PoolFarmJoin
          pool={props.pool}
          isOpen={openFarms}
          onClose={() => setOpenFarms(false)}
          onSelect={() => setOpenFarms(false)}
        />
      ) : (
        <PoolFarmPositionDetail
          pool={props.pool}
          isOpen={openFarms}
          onClose={() => setOpenFarms(false)}
          onSelect={() => setOpenFarms(false)}
        />
      )}
    </>
  )
}
