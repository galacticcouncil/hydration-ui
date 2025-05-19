import { Flex, Modal } from "@galacticcouncil/ui/components"
import { useState } from "react"

export type Farm = {
  id: number
  assetId: string
}

import { AvailableFarm } from "./AvailableFarm"
import { AvailableFarmModalBody } from "./AvailableFarmModalBody"

type AvailableFarmsProps = {
  farms: Farm[]
  className?: string
}

export const AvailableFarms = ({ farms, className }: AvailableFarmsProps) => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)

  return (
    <>
      <Flex direction="column" gap={20} className={className}>
        {farms.map((farm) => (
          <AvailableFarm key={farm.id} farm={farm} onClick={setSelectedFarm} />
        ))}
      </Flex>

      <Modal open={!!selectedFarm} onOpenChange={() => setSelectedFarm(null)}>
        <AvailableFarmModalBody farm={selectedFarm} />
      </Modal>
    </>
  )
}
