import { Flex, Modal, SectionHeader } from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const farms = [
  { id: 0, assetId: "5" },
  { id: 1, assetId: "0" },
  { id: 2, assetId: "15" },
]

export type Farm = {
  id: number
  assetId: string
}

import { AvailableFarm } from "./AvailableFarm"
import { AvailableFarmModalBody } from "./AvailableFarmModalBody"

export const AvailableFarms = () => {
  const { t } = useTranslation("liquidity")
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)

  if (farms.length === 0) return null

  return (
    <>
      <SectionHeader>{t("details.section.availableFarms")}</SectionHeader>

      <Flex gap={20} wrap>
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
