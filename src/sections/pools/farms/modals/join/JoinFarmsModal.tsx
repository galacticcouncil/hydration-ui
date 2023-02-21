import BN from "bignumber.js"
import { useState } from "react"

import { Modal } from "components/Modal/Modal"
import { FarmDetailsCard } from "../../components/detailsCard/FarmDetailsCard"
import { Button } from "components/Button/Button"
import { SJoinFarmContainer } from "./JoinFarmsModal.styled"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

const dummyData = [
  {
    depositNft: {
      deposit: {
        shares: BN(22222222222222222),
      },
    },
    farm: {
      assetId: "1",
      distributedRewards: BN(67788889389433788),
      maxRewards: BN(234455677889856658),
      fullness: BN(0.5),
      minApr: BN(0.5),
      apr: BN(0.9),
    },
  },
  {
    depositNft: undefined,
    farm: {
      assetId: "0",
      distributedRewards: BN(2345231478222228),
      maxRewards: BN(11123445522222888),
      fullness: BN(0.3),
      minApr: BN(0.5),
      apr: BN(0.9),
    },
  },
]

type JoinFarmModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const JoinFarmModal = ({ isOpen, onClose }: JoinFarmModalProps) => {
  const { t } = useTranslation()
  const [selectedYieldFarm, setSelectedYieldFarm] = useState<string | null>(
    null,
  )
  return (
    <Modal open={isOpen} onClose={onClose}>
      {/*Show Farm details alowng with loyalty graph */}
      {selectedYieldFarm ? (
        <div>FarmDetails</div>
      ) : (
        <div>
          <div sx={{ flex: "column", gap: 8, mt: 24 }}>
            {dummyData.map((el) => {
              return (
                <FarmDetailsCard
                  farm={el.farm}
                  depositNft={el.depositNft}
                  onSelect={setSelectedYieldFarm}
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
                21 855
              </Text>
            </div>
            <Button fullWidth variant="primary">
              {t("farms.modal.join.button.label")}
            </Button>
          </SJoinFarmContainer>
        </div>
      )}
    </Modal>
  )
}
