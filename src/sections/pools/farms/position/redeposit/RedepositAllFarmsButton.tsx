import { Button } from "components/Button/Button"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { JoinFarmModal } from "sections/pools/farms/modals/join/JoinFarmsModal"
import { TPool, useRejoinedFarms } from "sections/pools/PoolsPage.utils"
import { prop, uniqBy } from "utils/rx"

export const RedepositAllFarmsButton = ({ pool }: { pool: TPool }) => {
  const { t } = useTranslation()
  const [joinFarm, setJoinFarm] = useState(false)

  const rejoinFarms = useRejoinedFarms(pool)

  if (!rejoinFarms.length) return null

  const initialFarms = uniqBy(
    (farm) => farm.yieldFarmId,
    rejoinFarms.map(prop("farms")).flat(),
  )

  return (
    <>
      <Button size="small" variant="primary" onClick={() => setJoinFarm(true)}>
        {t("join")}
      </Button>
      {joinFarm && (
        <JoinFarmModal
          initialFarms={initialFarms}
          onClose={() => setJoinFarm(false)}
          rejoinFarms={rejoinFarms}
        />
      )}
    </>
  )
}
