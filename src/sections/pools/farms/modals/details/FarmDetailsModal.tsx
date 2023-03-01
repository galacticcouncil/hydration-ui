import { ModalMeta } from "components/Modal/Modal"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { useTranslation } from "react-i18next"
import BN from "bignumber.js"
import { FarmDetailsCard } from "../../components/detailsCard/FarmDetailsCard"
import { Text } from "components/Typography/Text/Text"
import { SLoyaltyRewardsContainer } from "./FarmDetailsModal.styled"
import { Spacer } from "components/Spacer/Spacer"
import { LoyaltyGraph } from "../../components/loyaltyGraph/LoyaltyGraph"
import { Farm } from "api/farms"

const dummyData = {
  farm: {
    apr: BN(223),
    globalFarm: {
      plannedYieldingPeriods: BN(302400),
    },
    currentPeriod: BN(23455),
  },
  loyaltyCurve: {
    initialRewardPercentage: BN(0.5),
    scaleCoef: BN(5000),
  },
  enteredAt: BN(242),
}

type FarmDetailsModalProps = {
  farm: Farm
  onBack: () => void
}

export const FarmDetailsModal = ({ farm, onBack }: FarmDetailsModalProps) => {
  const { t } = useTranslation()

  return (
    <>
      <ModalMeta
        title={t("farms.modal.details.title")}
        secondaryIcon={{
          icon: <ChevronRight css={{ transform: "rotate(180deg)" }} />,
          name: "Back",
          onClick: () => onBack(),
        }}
      />

      <Spacer size={16} />

      <FarmDetailsCard depositNft={undefined} farm={farm} />

      <SLoyaltyRewardsContainer>
        <Text
          fs={19}
          sx={{ mb: 30 }}
          font="FontOver"
          color="basic100"
          tTransform="uppercase"
        >
          {t("farms.modal.details.loyaltyRewards.label")}
        </Text>
        <LoyaltyGraph
          farm={dummyData.farm}
          loyaltyCurve={dummyData.loyaltyCurve}
          enteredAt={dummyData.enteredAt}
        />
      </SLoyaltyRewardsContainer>

      <Text sx={{ py: 30 }} color="basic400" tAlign="center">
        {t("farms.modal.details.description")}
      </Text>
    </>
  )
}
