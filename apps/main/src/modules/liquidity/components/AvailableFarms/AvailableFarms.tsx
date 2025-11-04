import { Modal } from "@galacticcouncil/ui/components"
import { useState } from "react"

import { Farm } from "@/api/farms"

import { AvailableFarm } from "./AvailableFarm"
import { AvailableFarmModalBody } from "./AvailableFarmModalBody"

type AvailableFarmsProps = {
  farms: Farm[]
}

export const AvailableFarms = ({ farms }: AvailableFarmsProps) => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)

  return (
    <>
      {farms.map((farm) => (
        <AvailableFarm
          key={farm.yieldFarmId}
          farm={farm}
          onClick={setSelectedFarm}
        />
      ))}

      <Modal open={!!selectedFarm} onOpenChange={() => setSelectedFarm(null)}>
        <AvailableFarmModalBody farm={selectedFarm} />
      </Modal>
    </>
  )
}
