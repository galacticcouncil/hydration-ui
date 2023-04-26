import { ModalMeta } from "components/Modal/ModalOld"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { useTranslation } from "react-i18next"
import { FarmDetailsCard } from "../../components/detailsCard/FarmDetailsCard"
import { Text } from "components/Typography/Text/Text"
import { SLoyaltyRewardsContainer } from "./FarmDetailsModal.styled"
import { Spacer } from "components/Spacer/Spacer"
import { LoyaltyGraph } from "../../components/loyaltyGraph/LoyaltyGraph"
import { Farm } from "api/farms"
import { DepositNftType } from "api/deposits"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { FarmDetailsModalValues } from "./FarmDetailsModalValues"
import { useRef } from "react"

type FarmDetailsModalProps = {
  pool: OmnipoolPool
  farm: Farm
  depositNft: DepositNftType | undefined
  onBack: () => void
  currentBlock?: number
}

export const FarmDetailsModal = ({
  farm,
  depositNft,
  onBack,
  pool,
  currentBlock,
}: FarmDetailsModalProps) => {
  const { t } = useTranslation()

  const loyaltyCurve = farm.yieldFarm.loyaltyCurve.unwrapOr(null)

  const enteredBlock = depositNft?.deposit.yieldFarmEntries
    .find(
      (entry) =>
        entry.yieldFarmId.eq(farm.yieldFarm.id) &&
        entry.globalFarmId.eq(farm.globalFarm.id),
    )
    ?.enteredAt.toBigNumber()

  const currentBlockRef = useRef<number | undefined>(currentBlock)

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

      <FarmDetailsCard poolId={pool.id} depositNft={depositNft} farm={farm} />

      {loyaltyCurve && currentBlockRef.current && (
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
            enteredAt={enteredBlock}
            currentBlock={currentBlockRef.current}
          />
        </SLoyaltyRewardsContainer>
      )}

      {depositNft && enteredBlock ? (
        <FarmDetailsModalValues
          yieldFarmId={farm.yieldFarm.id.toString()}
          depositNft={depositNft}
          pool={pool}
          enteredBlock={enteredBlock}
        />
      ) : (
        <Text sx={{ py: 30 }} color="basic400" tAlign="center">
          {t("farms.modal.details.description")}
        </Text>
      )}
    </>
  )
}
