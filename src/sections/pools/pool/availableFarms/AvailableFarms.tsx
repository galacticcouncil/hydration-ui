import { useTranslation } from "react-i18next"
import { TFarmAprData, useFarmCurrentPeriod } from "api/farms"
import { FarmDetailsCard } from "sections/pools/farms/components/detailsCard/FarmDetailsCard"
import { useState } from "react"
import { Modal } from "components/Modal/Modal"
import { FarmDetailsModal } from "sections/pools/farms/modals/details/FarmDetailsModal"
import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import { usePoolData } from "sections/pools/pool/Pool"

export const AvailableFarms = () => {
  const { t } = useTranslation()
  const [selectedFarm, setSelectedFarm] = useState<TFarmAprData | null>(null)
  const {
    pool: { farms },
  } = usePoolData()

  const { getCurrentPeriod } = useFarmCurrentPeriod()

  if (!farms.length) return null

  const currentBlock = selectedFarm
    ? getCurrentPeriod(selectedFarm.blocksPerPeriod)
    : undefined

  const isMultipleFarms = farms.length > 1

  return (
    <>
      <Separator
        color="white"
        opacity={0.06}
        sx={{
          mt: 4,
          mx: "-30px",
          width: "calc(100% + 60px)",
        }}
      />
      <div sx={{ flex: "column", gap: 10 }}>
        <Text fs={18} font="GeistMono" tTransform="uppercase">
          {t("farms.modal.joinedFarms.available.label")}
        </Text>
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
