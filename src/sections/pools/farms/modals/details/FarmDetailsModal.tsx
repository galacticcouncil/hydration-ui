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
import { BN_0 } from "utils/constants"
import { useClaimableAmount } from "utils/farms/claiming"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useAssetMeta } from "api/assetMeta"
import BigNumber from "bignumber.js"
import { useEnteredDate } from "utils/block"
import { useDepositShare } from "../../position/FarmingPosition.utils"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { Separator } from "components/Separator/Separator"

type FarmDetailsModalProps = {
  pool: OmnipoolPool
  farm: Farm
  depositNft: DepositNftType | undefined
  onBack: () => void
}

type FarmDetailsModalValuesProps = {
  pool: OmnipoolPool
  depositNft: DepositNftType
  enteredBlock: BigNumber
  yieldFarmId: string
}

const FarmDetailsModalValues = ({
  pool,
  depositNft,
  enteredBlock,
  yieldFarmId,
}: FarmDetailsModalValuesProps) => {
  const { t } = useTranslation()
  const claimable = useClaimableAmount(pool, depositNft)
  const depositReward = claimable.data?.depositRewards.find(
    (reward) => reward.yieldFarmId === yieldFarmId,
  )

  const meta = useAssetMeta(depositReward?.assetId)
  const entered = useEnteredDate(enteredBlock)

  const position = useDepositShare(pool.id, [depositNft.id.toString()])
    .data?.[0]

  if (!position) return null

  return (
    <div sx={{ p: "22px 12px 0" }}>
      <div sx={{ flex: "row", justify: "space-between", py: 12 }}>
        <Text fs={14} color="darkBlue200">
          {t("farms.modal.details.joinedOn.label")}
        </Text>
        <Text fs={14} tAlign="right">
          {t("farms.positions.labels.enterDate.value", {
            date: entered.data,
          })}
        </Text>
      </div>
      <Separator />
      <div sx={{ flex: "row", justify: "space-between", py: 12 }}>
        <Text fs={14} color="darkBlue200">
          {t("farms.modal.details.value.label")}
        </Text>
        <WalletAssetsHydraPositionsData
          fontSize={14}
          symbol={position.symbol}
          value={position.value}
          lrna={position.lrna}
        />
      </div>
      <Separator />
      <div sx={{ flex: "row", justify: "space-between", py: 12 }}>
        <Text fs={14} color="darkBlue200">
          {t("farms.modal.details.mined.label")}
        </Text>
        <Text fs={14} tAlign="right">
          {t("farms.modal.details.mined.value", {
            value: depositReward?.value,
            symbol: meta.data?.symbol,
            fixedPointScale: meta.data?.decimals,
          })}
        </Text>
      </div>
    </div>
  )
}

export const FarmDetailsModal = ({
  farm,
  depositNft,
  onBack,
  pool,
}: FarmDetailsModalProps) => {
  const { t } = useTranslation()

  const loyaltyCurve = farm.yieldFarm.loyaltyCurve.unwrapOr(null)
  const enteredBlock = depositNft?.deposit.yieldFarmEntries.reduce(
    (acc, curr) =>
      acc.lt(curr.enteredAt.toBigNumber()) ? curr.enteredAt.toBigNumber() : acc,
    BN_0,
  )

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
            enteredAt={enteredBlock}
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
