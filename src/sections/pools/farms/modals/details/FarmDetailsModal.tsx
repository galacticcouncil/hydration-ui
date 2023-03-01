import { ModalMeta } from "components/Modal/Modal"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { useTranslation } from "react-i18next"
import { FarmDetailsCard } from "../../components/detailsCard/FarmDetailsCard"
import { Text } from "components/Typography/Text/Text"
import { SLoyaltyRewardsContainer } from "./FarmDetailsModal.styled"
import { Spacer } from "components/Spacer/Spacer"
import { LoyaltyGraph } from "../../components/loyaltyGraph/LoyaltyGraph"
import { Farm } from "api/farms"
import { DepositNftType } from "api/deposits"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"

type FarmDetailsModalProps = {
  farm: Farm
  depositNft: DepositNftType | undefined
  position?: PalletLiquidityMiningYieldFarmEntry
  onBack: () => void
}

export const FarmDetailsModal = ({
  farm,
  depositNft,
  position,
  onBack,
}: FarmDetailsModalProps) => {
  const { t } = useTranslation()

  const loyaltyCurve = farm.yieldFarm.loyaltyCurve.unwrapOr(null)

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

      <FarmDetailsCard depositNft={depositNft} farm={farm} />

      {loyaltyCurve && (
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
            farm={farm}
            loyaltyCurve={loyaltyCurve}
            enteredAt={position?.enteredAt.toBigNumber()}
          />
        </SLoyaltyRewardsContainer>
      )}

      <Text sx={{ py: 30 }} color="basic400" tAlign="center">
        {t("farms.modal.details.description")}
      </Text>
    </>
  )
}
