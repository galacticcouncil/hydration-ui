import { useState } from "react"
import { Modal } from "components/Modal/Modal"
import { FarmDetailsCard } from "../../components/detailsCard/FarmDetailsCard"
import { Button } from "components/Button/Button"
import { SJoinFarmContainer } from "./JoinFarmsModal.styled"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FarmDetailsModal } from "../details/FarmDetailsModal"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { useFarms } from "api/farms"
import { u32 } from "@polkadot/types"
import { useMutation } from "@tanstack/react-query"
import { useStore } from "state/store"
import { useApiPromise } from "utils/api"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"

type JoinFarmModalProps = {
  isOpen: boolean
  onClose: () => void
  pool: OmnipoolPool
  position: HydraPositionsTableData
  isRedeposit?: boolean
}

export const JoinFarmModal = ({
  isOpen,
  onClose,
  isRedeposit,
  pool,
  position,
}: JoinFarmModalProps) => {
  const { t } = useTranslation()
  const [selectedFarmId, setSelectedFarmId] = useState<{
    yieldFarmId: u32
    globalFarmId: u32
  } | null>(null)
  const farms = useFarms(pool.id)

  const selectedFarm = farms.data?.find(
    (farm) =>
      farm.globalFarm.id.eq(selectedFarmId?.globalFarmId) &&
      farm.yieldFarm.id.eq(selectedFarmId?.yieldFarmId),
  )

  const { createTransaction } = useStore()
  const api = useApiPromise()
  const joinFarm = useMutation(async () => {
    const [firstFarm, ...restFarm] = farms.data ?? []
    if (firstFarm == null) throw new Error("Missing farm")

    // TODO: add error handling and better toast descriptions
    const firstDeposit = await createTransaction({
      tx: api.tx.omnipoolLiquidityMining.depositShares(
        firstFarm.globalFarm.id,
        firstFarm.yieldFarm.id,
        position.id,
      ),
    })

    for (const record of firstDeposit.events) {
      if (api.events.omnipoolLiquidityMining.SharesDeposited.is(record.event)) {
        const depositId = record.event.data.depositId

        const txs = restFarm.map((farm) =>
          api.tx.omnipoolLiquidityMining.redepositShares(
            farm.globalFarm.id,
            farm.yieldFarm.id,
            depositId,
          ),
        )

        await createTransaction({
          tx: txs.length > 1 ? api.tx.utility.batch(txs) : txs[0],
        })
      }
    }
  })

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("farms.modal.join.title", { assetSymbol: "HDX" })}
    >
      {isRedeposit && (
        <Text color="basic400">
          {t("farms.modal.join.description", { assets: "HDX" })}
        </Text>
      )}
      {selectedFarm ? (
        <FarmDetailsModal
          farm={selectedFarm}
          onBack={() => setSelectedFarmId(null)}
        />
      ) : (
        <div>
          <div sx={{ flex: "column", gap: 8, mt: 24 }}>
            {farms.data?.map((farm, i) => {
              return (
                <FarmDetailsCard
                  key={i}
                  farm={farm}
                  depositNft={undefined}
                  onSelect={() =>
                    setSelectedFarmId({
                      globalFarmId: farm.globalFarm.id,
                      yieldFarmId: farm.yieldFarm.id,
                    })
                  }
                />
              )
            })}
          </div>
          <SJoinFarmContainer>
            <div
              sx={{
                flex: "row",
                justify: "space-between",
                p: 30,
                gap: 120,
              }}
            >
              <div sx={{ flex: "column", gap: 13 }}>
                <Text>{t("farms.modal.footer.title")}</Text>
                <Text color="basic500">{t("farms.modal.footer.desc")}</Text>
              </div>
              <Text color="pink600" fs={24} css={{ whiteSpace: "nowrap" }}>
                {t("value.token", {
                  value: position.providedAmount,
                  fixedPointScale: 12,
                })}
              </Text>
            </div>
            <Button
              fullWidth
              variant="primary"
              onClick={() => joinFarm.mutate()}
              isLoading={joinFarm.isLoading}
            >
              {t("farms.modal.join.button.label")}
            </Button>
          </SJoinFarmContainer>
        </div>
      )}
    </Modal>
  )
}
