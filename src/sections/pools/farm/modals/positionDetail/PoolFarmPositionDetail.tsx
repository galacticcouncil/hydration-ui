import { Modal } from "components/Modal/Modal"
import { u32 } from "@polkadot/types"
import { useAPR } from "utils/farms/apr"
import { PoolBase } from "@galacticcouncil/sdk"
import { useState } from "react"
import { PoolFarmPositionDetailSectionList } from "./PoolFarmPositionDetailSectionList"
import { PoolFarmPositionDetailSectionItem } from "./PoolFarmPositionDetailSectionItem"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"
import { DepositNftType } from "api/deposits"

export const PoolFarmPositionDetail = (props: {
  pool: PoolBase
  isOpen: boolean
  onClose: () => void
  onSelect: () => void
}) => {
  const apr = useAPR(props.pool.address)

  const [selectedYieldFarmId, setSelectedYieldFarmId] = useState<{
    globalFarmId: u32
    yieldFarmId: u32
    yieldFarmEntry?: PalletLiquidityMiningYieldFarmEntry
    depositNft?: DepositNftType
  } | null>(null)

  const selectedFarm = selectedYieldFarmId
    ? apr.data.find(
        (i) =>
          i.yieldFarm.id.eq(selectedYieldFarmId.yieldFarmId) &&
          i.globalFarm.id.eq(selectedYieldFarmId.globalFarmId),
      )
    : null

  return (
    <Modal open={props.isOpen} onClose={props.onClose}>
      <div sx={{ flex: "column", gap: 8, mt: 24 }}>
        {selectedFarm != null ? (
          <PoolFarmPositionDetailSectionItem
            pool={props.pool}
            farm={selectedFarm}
            onBack={() => setSelectedYieldFarmId(null)}
            position={selectedYieldFarmId?.yieldFarmEntry}
            depositNft={selectedYieldFarmId?.depositNft}
          />
        ) : (
          <PoolFarmPositionDetailSectionList
            pool={props.pool}
            onSelect={setSelectedYieldFarmId}
          />
        )}
      </div>
    </Modal>
  )
}
