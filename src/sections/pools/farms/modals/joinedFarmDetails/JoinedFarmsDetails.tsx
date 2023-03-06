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
import { useFarmRedepositMutation } from "utils/farms/redeposit"
import { useFarmExitAllMutation } from "utils/farms/exit"
import { useAccountStore } from "state/store"

function isFarmJoined(depositNft: DepositNftType, farm: Farm) {
  return depositNft.deposit.yieldFarmEntries.find(
    (entry) =>
      entry.globalFarmId.eq(farm.globalFarm.id) &&
      entry.yieldFarmId.eq(farm.yieldFarm.id),
  )
}

function JoinedFarmsDetailsRedeposit(props: {
  pool: OmnipoolPool
  depositNft: DepositNftType
  onSelect: (value: { globalFarm: u32; yieldFarm: u32 }) => void
}) {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const farms = useFarms(props.pool.id)

  const availableFarms = farms.data?.filter(
    (farm) => !isFarmJoined(props.depositNft, farm),
  )

  const redeposit = useFarmRedepositMutation(availableFarms, [props.depositNft])

  if (!availableFarms?.length) return null
  return (
    <>
      <Text color="neutralGray100" sx={{ mb: 18 }}>
        {t("farms.modal.joinedFarms.available.label")}
      </Text>
      <div sx={{ flex: "column", gap: 12 }}>
        {availableFarms?.map((farm, i) => (
          <FarmDetailsCard
            key={i}
            farm={farm}
            depositNft={props.depositNft}
            onSelect={() =>
              props.onSelect({
                globalFarm: farm.globalFarm.id,
                yieldFarm: farm.yieldFarm.id,
              })
            }
          />
        ))}
        <Button
          fullWidth
          variant="primary"
          sx={{ mt: 16 }}
          onClick={() => redeposit.mutate()}
          disabled={account?.isExternalWalletConnected}
          isLoading={redeposit.isLoading}
        >
          {t("farms.modal.joinedFarms.button.joinAll.label")}
        </Button>
      </div>
    </>
  )
}

function JoinedFarmsDetailsPositions(props: {
  pool: OmnipoolPool
  depositNft: DepositNftType
  onSelect: (value: { globalFarm: u32; yieldFarm: u32 }) => void
}) {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const farms = useFarms(props.pool.id)
  const joinedFarms = farms.data?.filter((farm) =>
    isFarmJoined(props.depositNft, farm),
  )

  const exit = useFarmExitAllMutation([props.depositNft])

  return (
    <>
      <Text color="neutralGray100" sx={{ mb: 18, mt: 20 }}>
        {t("farms.modal.joinedFarms.joined.label")}
      </Text>

      <ClaimRewardsCard pool={props.pool} depositNft={props.depositNft} />

      <div sx={{ flex: "column", gap: 12, mt: 12 }}>
        {joinedFarms?.map((farm, i) => (
          <FarmDetailsCard
            key={i}
            farm={farm}
            depositNft={props.depositNft}
            onSelect={() =>
              props.onSelect({
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
        onClick={() => exit.mutate()}
        isLoading={exit.isLoading}
        disabled={account?.isExternalWalletConnected}
      >
        {t("farms.modal.joinedFarms.button.exit.label")}
      </Button>
    </>
  )
}

export const JoinedFarmsDetails = (props: {
  isOpen: boolean
  onClose: () => void
  pool: OmnipoolPool
  depositNft: DepositNftType
}) => {
  const { t } = useTranslation()
  const [selectedFarmIds, setSelectedFarmIds] = useState<{
    globalFarm: u32
    yieldFarm: u32
  } | null>(null)

  const farms = useFarms(props.pool.id)
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
      open={props.isOpen}
      onClose={props.onClose}
      title={t("farms.modal.join.title", { assetSymbol: "HDX" })}
    >
      {selectedFarm ? (
        <FarmDetailsModal
          farm={selectedFarm}
          depositNft={props.depositNft}
          onBack={() => setSelectedFarmIds(null)}
        />
      ) : (
        <div sx={{ flex: "column" }}>
          <JoinedFarmsDetailsPositions
            pool={props.pool}
            depositNft={props.depositNft}
            onSelect={(value) => setSelectedFarmIds(value)}
          />

          <JoinedFarmsDetailsRedeposit
            pool={props.pool}
            depositNft={props.depositNft}
            onSelect={(value) => setSelectedFarmIds(value)}
          />
        </div>
      )}
    </Modal>
  )
}
