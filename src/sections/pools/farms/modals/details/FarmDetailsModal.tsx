import { DepositNftType } from "api/deposits"
import { Farm } from "api/farms"
import { Text } from "components/Typography/Text/Text"
import { useRef } from "react"
import { useTranslation } from "react-i18next"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { FarmDetailsCard } from "sections/pools/farms/components/detailsCard/FarmDetailsCard"
import { LoyaltyGraph } from "sections/pools/farms/components/loyaltyGraph/LoyaltyGraph"
import { SLoyaltyRewardsContainer } from "./FarmDetailsModal.styled"
import { FarmDetailsModalValues } from "./FarmDetailsModalValues"

type FarmDetailsModalProps = {
  pool: OmnipoolPool
  farm: Farm
  depositNft: DepositNftType | undefined
  currentBlock?: number
}

export const FarmDetailsModal = ({
  farm,
  depositNft,
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
        <Text sx={{ pt: 30 }} color="basic400" tAlign="center">
          {t("farms.modal.details.description")}
        </Text>
      )}
    </>
  )
}
