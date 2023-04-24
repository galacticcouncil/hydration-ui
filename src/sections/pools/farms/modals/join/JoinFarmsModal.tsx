import { useState } from "react"
import { Modal } from "components/Modal/Modal"
import { FarmDetailsCard } from "../../components/detailsCard/FarmDetailsCard"
import { Button } from "components/Button/Button"
import { SJoinFarmContainer } from "./JoinFarmsModal.styled"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FarmDetailsModal } from "../details/FarmDetailsModal"
import { Farm } from "api/farms"
import { u32 } from "@polkadot/types"
import { useAssetMeta } from "api/assetMeta"
import { FarmDepositMutationType } from "utils/farms/deposit"
import { FarmRedepositMutationType } from "utils/farms/redeposit"
import BigNumber from "bignumber.js"
import { DepositNftType } from "api/deposits"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"

type JoinFarmModalProps = {
  isOpen: boolean
  onClose: () => void
  pool: OmnipoolPool
  shares: BigNumber
  farms: Farm[]
  isRedeposit?: boolean
  mutation: FarmDepositMutationType | FarmRedepositMutationType
  depositNft?: DepositNftType
}

export const JoinFarmModal = ({
  isOpen,
  onClose,
  isRedeposit,
  pool,
  mutation,
  shares,
  depositNft,
  farms,
}: JoinFarmModalProps) => {
  const { t } = useTranslation()
  const [selectedFarmId, setSelectedFarmId] = useState<{
    yieldFarmId: u32
    globalFarmId: u32
  } | null>(null)
  const meta = useAssetMeta(pool.id)

  const selectedFarm = farms.find(
    (farm) =>
      farm.globalFarm.id.eq(selectedFarmId?.globalFarmId) &&
      farm.yieldFarm.id.eq(selectedFarmId?.yieldFarmId),
  )

  return (
    <Modal
      withoutOutsideClose
      open={isOpen}
      onClose={onClose}
      title={t("farms.modal.join.title", { assetSymbol: meta.data?.symbol })}
    >
      {selectedFarm ? (
        <FarmDetailsModal
          pool={pool}
          farm={selectedFarm}
          depositNft={depositNft}
          onBack={() => setSelectedFarmId(null)}
        />
      ) : (
        <div>
          {isRedeposit && (
            <Text color="basic400">
              {t("farms.modal.join.description", { assets: "HDX" })}
            </Text>
          )}
          <div sx={{ flex: "column", gap: 8, mt: 24 }}>
            {farms.map((farm, i) => {
              return (
                <FarmDetailsCard
                  key={i}
                  poolId={pool.id}
                  farm={farm}
                  depositNft={depositNft}
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
              </div>
              <Text color="pink600" fs={24} css={{ whiteSpace: "nowrap" }}>
                {t("value.token", {
                  value: shares,
                  fixedPointScale: meta.data?.decimals.toString() ?? 12,
                })}
              </Text>
            </div>
            <Button
              fullWidth
              variant="primary"
              onClick={() => mutation.mutate()}
              isLoading={mutation.isLoading}
            >
              {t("farms.modal.join.button.label", { count: farms.length })}
            </Button>
          </SJoinFarmContainer>
        </div>
      )}
    </Modal>
  )
}
