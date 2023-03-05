import { useState } from "react"
import { Modal } from "components/Modal/Modal"
import { FarmDetailsCard } from "../../components/detailsCard/FarmDetailsCard"
import { Button } from "components/Button/Button"
import { SJoinFarmContainer } from "./JoinFarmsModal.styled"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FarmDetailsModal } from "../details/FarmDetailsModal"
import { useFarms } from "api/farms"
import { u32 } from "@polkadot/types"
import { useAssetMeta } from "api/assetMeta"
import { FarmDepositMutationType } from "utils/farms/deposit"
import { FarmRedepositMutationType } from "utils/farms/redeposit"
import BigNumber from "bignumber.js"
import { DepositNftType } from "api/deposits"

type JoinFarmModalProps = {
  isOpen: boolean
  onClose: () => void
  poolId: u32
  shares: BigNumber
  isRedeposit?: boolean
  mutation: FarmDepositMutationType | FarmRedepositMutationType
  depositNft?: DepositNftType
}

export const JoinFarmModal = ({
  isOpen,
  onClose,
  isRedeposit,
  poolId,
  mutation,
  shares,
  depositNft,
}: JoinFarmModalProps) => {
  const { t } = useTranslation()
  const [selectedFarmId, setSelectedFarmId] = useState<{
    yieldFarmId: u32
    globalFarmId: u32
  } | null>(null)
  const farms = useFarms(poolId)
  const meta = useAssetMeta(poolId)

  const selectedFarm = farms.data?.find(
    (farm) =>
      farm.globalFarm.id.eq(selectedFarmId?.globalFarmId) &&
      farm.yieldFarm.id.eq(selectedFarmId?.yieldFarmId),
  )

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("farms.modal.join.title", { assetSymbol: "HDX" })}
    >
      {selectedFarm ? (
        <FarmDetailsModal
          poolId={poolId}
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
            {farms.data?.map((farm, i) => {
              return (
                <FarmDetailsCard
                  key={i}
                  poolId={poolId}
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
                <Text color="basic500">{t("farms.modal.footer.desc")}</Text>
              </div>
              <Text color="pink600" fs={24} css={{ whiteSpace: "nowrap" }}>
                {t("value.token", {
                  value: shares,
                  fixedPointScale: meta.data?.decimals ?? 12,
                })}
              </Text>
            </div>
            <Button
              fullWidth
              variant="primary"
              onClick={() => mutation.mutate()}
              isLoading={mutation.isLoading}
            >
              {t("farms.modal.join.button.label")}
            </Button>
          </SJoinFarmContainer>
        </div>
      )}
    </Modal>
  )
}
