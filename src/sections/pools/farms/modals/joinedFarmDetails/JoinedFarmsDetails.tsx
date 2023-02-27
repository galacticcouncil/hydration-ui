import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FarmDetailsModal } from "../details/FarmDetailsModal"
import { FarmDetailsCard } from "../../components/detailsCard/FarmDetailsCard"
import { ClaimeRewardsCard } from "../../components/claimableCard/ClaimeRewardsCard"
import { useFarms } from "api/farms"

type JoinedFarmsDetailsProps = {
  isOpen: boolean
  onClose: () => void
  availableFarms: any
  joinedFarms: any
}

export const JoinedFarmsDetails = ({
  isOpen,
  onClose,
  availableFarms,
  joinedFarms,
}: JoinedFarmsDetailsProps) => {
  const { t } = useTranslation()
  const [selectedYieldFarm, setSelectedYieldFarm] = useState<string | null>(
    null,
  )

  // test data
  const farms = useFarms("6")
  const farm = farms.data?.[0]

  if (!farm) return null
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("farms.modal.join.title", { assetSymbol: "HDX" })}
    >
      {selectedYieldFarm ? (
        <FarmDetailsModal
          farm={farm}
          onBack={() => setSelectedYieldFarm(null)}
        />
      ) : (
        <div sx={{ flex: "column" }}>
          <Text color="neutralGray100" sx={{ mb: 18, mt: 20 }}>
            {t("farms.modal.joinedFarms.joined.label")}
          </Text>
          <ClaimeRewardsCard />
          <div sx={{ flex: "column", gap: 12, mt: 12 }}>
            {joinedFarms.map((el: any, i: number) => {
              return (
                <FarmDetailsCard
                  key={i}
                  farm={farm}
                  depositNft={el.depositNft}
                  onSelect={() => setSelectedYieldFarm("1")}
                />
              )
            })}
          </div>

          <Button
            sx={{ width: "fit-content", my: 21 }}
            css={{ alignSelf: "center" }}
          >
            {t("farms.modal.joinedFarms.button.exit.label")}
          </Button>
          <Text color="neutralGray100" sx={{ mb: 18 }}>
            {t("farms.modal.joinedFarms.available.label")}
          </Text>
          <div sx={{ flex: "column", gap: 12 }}>
            {availableFarms.map((el: any, i: number) => {
              return (
                <FarmDetailsCard
                  key={i}
                  farm={farm}
                  depositNft={el.depositNft}
                  onSelect={() => setSelectedYieldFarm("1")}
                />
              )
            })}
            <Button fullWidth variant="primary" sx={{ mt: 16 }}>
              {t("farms.modal.joinedFarms.button.joinAll.label")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
