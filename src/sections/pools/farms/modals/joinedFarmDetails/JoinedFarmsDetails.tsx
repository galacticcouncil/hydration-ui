import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FarmDetailsModal } from "sections/pools/farms/modals/details/FarmDetailsModal"
import { FarmDetailsCard } from "sections/pools/farms/components/detailsCard/FarmDetailsCard"
import { ClaimRewardsCard } from "sections/pools/farms/components/claimableCard/ClaimRewardsCard"
import { Farm, useFarms } from "api/farms"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { DepositNftType } from "api/deposits"
import { u32 } from "@polkadot/types"

type JoinedFarmsDetailsProps = {
  isOpen: boolean
  onClose: () => void
  pool: OmnipoolPool
  depositNft: DepositNftType
}

export const JoinedFarmsDetails = ({
  pool,
  isOpen,
  onClose,
  depositNft,
}: JoinedFarmsDetailsProps) => {
  const { t } = useTranslation()
  const [selectedFarmIds, setSelectedFarmIds] = useState<{
    globalFarm: u32
    yieldFarm: u32
  } | null>(null)

  const farms = useFarms(pool.id)
  function isFarmJoined(farm: Farm) {
    return depositNft.deposit.yieldFarmEntries.find(
      (entry) =>
        entry.globalFarmId.eq(farm.globalFarm.id) &&
        entry.yieldFarmId.eq(farm.yieldFarm.id),
    )
  }

  const joinedFarms = farms.data?.filter((farm) => isFarmJoined(farm))
  const availabeFarms = farms.data?.filter((farm) => !isFarmJoined(farm))

  const selectedFarm =
    selectedFarmIds != null
      ? farms.data?.find(
          (farm) =>
            farm.globalFarm.id.eq(selectedFarmIds.globalFarm) &&
            farm.yieldFarm.id.eq(selectedFarmIds.yieldFarm),
        )
      : undefined

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("farms.modal.join.title", { assetSymbol: "HDX" })}
    >
      {selectedFarm ? (
        <FarmDetailsModal
          farm={selectedFarm}
          onBack={() => setSelectedFarmIds(null)}
        />
      ) : (
        <div sx={{ flex: "column" }}>
          <Text color="neutralGray100" sx={{ mb: 18, mt: 20 }}>
            {t("farms.modal.joinedFarms.joined.label")}
          </Text>

          <ClaimRewardsCard pool={pool} depositNft={depositNft} />

          <div sx={{ flex: "column", gap: 12, mt: 12 }}>
            {joinedFarms?.map((farm, i) => (
              <FarmDetailsCard
                key={i}
                farm={farm}
                depositNft={depositNft}
                onSelect={() =>
                  setSelectedFarmIds({
                    globalFarm: farm.globalFarm.id,
                    yieldFarm: farm.yieldFarm.id,
                  })
                }
              />
            ))}
          </div>

          <Button
            sx={{ width: "fit-content", my: 21 }}
            css={{ alignSelf: "center" }}
          >
            {t("farms.modal.joinedFarms.button.exit.label")}
          </Button>
          <Text color="neutralGray100" sx={{ mb: 18 }}>
            {t("farms.modal.joinedFarms.available.label")}
          </Text>
          <div sx={{ flex: "column", gap: 12 }}>
            {availabeFarms?.map((farm, i) => (
              <FarmDetailsCard
                key={i}
                farm={farm}
                depositNft={depositNft}
                onSelect={() =>
                  setSelectedFarmIds({
                    globalFarm: farm.globalFarm.id,
                    yieldFarm: farm.yieldFarm.id,
                  })
                }
              />
            ))}
            <Button fullWidth variant="primary" sx={{ mt: 16 }}>
              {t("farms.modal.joinedFarms.button.joinAll.label")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
