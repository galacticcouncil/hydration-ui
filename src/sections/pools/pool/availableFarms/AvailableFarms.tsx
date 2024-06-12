import { useTranslation } from "react-i18next"
import { TPool, TXYKPool } from "sections/pools/PoolsPage.utils"
import { useFarms } from "api/farms"
import { FarmDetailsCard } from "sections/pools/farms/components/detailsCard/FarmDetailsCard"
import { useState } from "react"
import { u32 } from "@polkadot/types"
import { Modal } from "components/Modal/Modal"
import { FarmDetailsModal } from "sections/pools/farms/modals/details/FarmDetailsModal"
import { useBestNumber } from "api/chain"
import { Text } from "components/Typography/Text/Text"

export const AvailableFarms = ({ pool }: { pool: TPool | TXYKPool }) => {
  const { t } = useTranslation()
  const [selectedFarmId, setSelectedFarmId] = useState<{
    yieldFarmId: u32
    globalFarmId: u32
  } | null>(null)
  const farms = useFarms([pool.id])
  const bestNumber = useBestNumber()

  if (!farms.data?.length) return null

  const selectedFarm = farms.data.find(
    (farm) =>
      farm.globalFarm.id.eq(selectedFarmId?.globalFarmId) &&
      farm.yieldFarm.id.eq(selectedFarmId?.yieldFarmId),
  )

  const currentBlock = bestNumber.data?.relaychainBlockNumber
    .toBigNumber()
    .dividedToIntegerBy(
      selectedFarm?.globalFarm.blocksPerPeriod.toNumber() ?? 1,
    )

  return (
    <>
      <div
        sx={{ flex: "column", gap: 10, p: ["0px 12px 12px", 30], bg: "gray" }}
      >
        <Text fs={18} font="GeistMonoSemiBold">
          {t("farms.modal.joinedFarms.available.label")}
        </Text>
        <div sx={{ flex: "column", gap: 20 }}>
          {farms.data.map((farm, i) => {
            return (
              <FarmDetailsCard
                key={i}
                poolId={pool.id}
                farm={farm}
                onSelect={() => {
                  setSelectedFarmId({
                    globalFarmId: farm.globalFarm.id,
                    yieldFarmId: farm.yieldFarm.id,
                  })
                }}
              />
            )
          })}
        </div>
      </div>
      {selectedFarm && (
        <Modal
          open={true}
          onClose={() => setSelectedFarmId(null)}
          title={t("farms.modal.details.title")}
        >
          <FarmDetailsModal
            poolId={pool.id}
            farm={selectedFarm}
            depositNft={undefined}
            currentBlock={currentBlock?.toNumber()}
          />
        </Modal>
      )}
    </>
  )
}
