import { useTranslation } from "react-i18next"
import { TFarmAprData, useFarmCurrentPeriod } from "api/farms"
import { FarmDetailsCard } from "sections/pools/farms/components/detailsCard/FarmDetailsCard"
import { useState } from "react"
import { Modal } from "components/Modal/Modal"
import { FarmDetailsModal } from "sections/pools/farms/modals/details/FarmDetailsModal"

export const AvailableFarms = ({ farms }: { farms: TFarmAprData[] }) => {
  const { t } = useTranslation()
  const [selectedFarm, setSelectedFarm] = useState<TFarmAprData | null>(null)

  const { getCurrentPeriod } = useFarmCurrentPeriod()

  const currentBlock = selectedFarm
    ? getCurrentPeriod(selectedFarm.blocksPerPeriod)
    : undefined

  const isMultipleFarms = farms.length > 1

  return (
    <>
      <div
        sx={{
          flex: ["column", isMultipleFarms ? "row" : "column"],
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {farms.map((farm, i) => (
          <FarmDetailsCard
            compact
            key={i}
            farm={farm}
            onSelect={() => setSelectedFarm(farm)}
          />
        ))}
      </div>

      {selectedFarm && (
        <Modal
          open
          onClose={() => setSelectedFarm(null)}
          title={t("farms.modal.details.title")}
        >
          <FarmDetailsModal
            farm={selectedFarm}
            currentBlock={currentBlock?.toNumber()}
          />
        </Modal>
      )}
    </>
  )
}
