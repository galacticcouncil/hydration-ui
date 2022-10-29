import { Modal } from "components/Modal/Modal"
import { u32 } from "@polkadot/types"
import { useAPR } from "utils/farms/apr"
import { PoolBase } from "@galacticcouncil/sdk"
import { useState } from "react"
import { PoolJoinFarmSectionList } from "./PoolJoinFarmSectionList"
import { PoolJoinFarmSectionDetail } from "./PoolJoinFarmSectionDetail"
import {
  PalletLiquidityMiningDepositData,
  PalletLiquidityMiningYieldFarmEntry,
} from "@polkadot/types/lookup"
import { u128 } from "@polkadot/types-codec"

export const PoolJoinFarm = (props: {
  pool: PoolBase
  isOpen: boolean
  onClose: () => void
  onSelect: () => void
  initialFarm?: { globalFarmId: u32; yieldFarmId: u32 }
}) => {
  const apr = useAPR(props.pool.address)

  const [selectedYieldFarmId, setSelectedYieldFarmId] = useState<{
    globalFarmId: u32
    yieldFarmId: u32
    yieldFarmEntry?: PalletLiquidityMiningYieldFarmEntry
    deposit?: { id: u128; deposit: PalletLiquidityMiningDepositData }
  } | null>(props.initialFarm || null)

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
          <PoolJoinFarmSectionDetail
            pool={props.pool}
            farm={selectedFarm}
            position={selectedYieldFarmId?.yieldFarmEntry}
            onBack={() => setSelectedYieldFarmId(null)}
            deposit={selectedYieldFarmId?.deposit}
          />
        ) : (
          <PoolJoinFarmSectionList
            pool={props.pool}
            onSelect={setSelectedYieldFarmId}
          />
        )}
      </div>
    </Modal>
  )
}
