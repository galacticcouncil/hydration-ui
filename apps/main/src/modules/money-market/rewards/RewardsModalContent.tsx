import {
  useClaimableRewards,
  useMoneyMarket,
} from "@galacticcouncil/money-market/react"
import {
  Flex,
  Icon,
  LoadingButton,
  ModalContentDivider,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { BadgeDollarSign } from "lucide-react"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { type Address } from "viem"

import {
  type RewardsDistributorAccrued,
  type RewardsDistributorClaim,
} from "@/api/rewardsDistributor"
import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import {
  HeaderSelect,
  type HeaderSelectOption,
} from "@/modules/money-market/actions/HeaderSelect"
import { MIN_CLAIMABLE_INCENTIVES_USDT } from "@/modules/money-market/constants"
import { useUserAddress } from "@/modules/money-market/hooks"
import { reserveAssetId } from "@/modules/money-market/reserves/reserves"
import { DistributorRewards } from "@/modules/money-market/rewards/DistributorRewards"
import {
  getDistributorRewardsAssetId,
  getDistributorRewardsSymbol,
  hasDistributorRewards,
} from "@/modules/money-market/rewards/DistributorRewards.utils"
import { type RewardsClaimSelection } from "@/modules/money-market/rewards/RewardsModal.tx"
import { RewardsModalRow } from "@/modules/money-market/rewards/RewardsModalRow"

const ALL = "all"
const DISTRIBUTOR = "distributor"

/** Everything, the distributor's rewards, or one of the controller's tokens. */
type Selection = typeof ALL | typeof DISTRIBUTOR | Address

type RewardsModalContentProps = {
  claim: RewardsDistributorClaim
  accrued: RewardsDistributorAccrued
  isClaiming: boolean
  onClaim: (selection: RewardsClaimSelection) => void
}

/** The claim window's rewards, with a choice of which to claim. */
export const RewardsModalContent: FC<RewardsModalContentProps> = ({
  claim,
  accrued,
  isClaiming,
  onClaim,
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const { market } = useMoneyMarket()
  const user = useUserAddress()
  const { data: claimable, isPending } = useClaimableRewards(user)
  const [selected, setSelected] = useState<Selection>(ALL)

  const rewards = (claimable ?? []).filter(({ amountUsd }) =>
    Big(amountUsd).gt(0),
  )
  const controllerUsd = rewards.reduce(
    (sum, { amountUsd }) => sum.plus(amountUsd),
    Big(0),
  )
  const isControllerEmpty = controllerUsd.lt(MIN_CLAIMABLE_INCENTIVES_USDT)
  const isDistributorClaimable = claim.status === "claimable"
  const distributorSymbol = getDistributorRewardsSymbol(claim, accrued)
  const distributorLabel = t("borrow:distributorRewards.label", {
    symbol: distributorSymbol,
  })

  const logo = (assetId: string) => <AssetLogo id={assetId} size="medium" />

  const options: HeaderSelectOption<Selection>[] = [
    {
      key: ALL,
      label: t("borrow:claim.allRewards"),
      icon: (
        <Icon
          size="xl"
          color={getToken("accents.info.onPrimary")}
          component={BadgeDollarSign}
        />
      ),
    },
    ...(isControllerEmpty ? [] : rewards).map(
      ({ rewardTokenAddress, rewardTokenSymbol }) => ({
        key: rewardTokenAddress,
        label: rewardTokenSymbol,
        icon: logo(reserveAssetId(rewardTokenAddress, market)),
      }),
    ),
    ...(isDistributorClaimable
      ? [
          {
            key: DISTRIBUTOR,
            label: distributorLabel,
            icon: logo(getDistributorRewardsAssetId(claim, accrued)),
          } as const,
        ]
      : []),
  ]
  const hasChoice = options.length > 2
  // back to all once the chosen reward is gone, as after a refetch
  const selection = options.some(({ key }) => key === selected) ? selected : ALL

  const controllerRows =
    selection === ALL
      ? rewards
      : rewards.filter(
          ({ rewardTokenAddress }) => rewardTokenAddress === selection,
        )
  const [controllerRow] = controllerRows
  const showsDistributor =
    (selection === ALL || selection === DISTRIBUTOR) &&
    hasDistributorRewards(claim, accrued)

  const totalUsd = controllerRows
    .reduce((sum, { amountUsd }) => sum.plus(amountUsd), Big(0))
    .plus(showsDistributor && isDistributorClaimable ? claim.owedUsd : 0)

  const toClaim: RewardsClaimSelection = {
    controller:
      selection === ALL
        ? isControllerEmpty
          ? undefined
          : "all"
        : selection === DISTRIBUTOR
          ? undefined
          : controllerRow,
    distributor: showsDistributor && isDistributorClaimable,
  }

  const claimLabel = !hasChoice
    ? t("borrow:claim")
    : selection === ALL
      ? t("borrow:claim.all")
      : t("borrow:claim.symbol", {
          symbol:
            selection === DISTRIBUTOR
              ? distributorLabel
              : controllerRow?.rewardTokenSymbol,
        })

  return (
    // a flat list: the window is the only box
    <Stack separated separator={<ModalContentDivider />} gap="l">
      {hasChoice && (
        <HeaderSelect
          label={t("borrow:claim.rewardsToClaim")}
          options={options}
          value={selection}
          onChange={setSelected}
        />
      )}
      <Flex justify="space-between" gap="m">
        <Text fs="p6" fw={500} color={getToken("text.low")}>
          {t("asset")}
        </Text>
        <Text fs="p6" fw={500} color={getToken("text.low")}>
          {t("balance")}
        </Text>
      </Flex>
      {controllerRows.map(
        ({ rewardTokenAddress, rewardTokenSymbol, amount, amountUsd }) => (
          <RewardsModalRow
            key={rewardTokenAddress}
            assetId={reserveAssetId(rewardTokenAddress, market)}
            label={rewardTokenSymbol}
            symbol={rewardTokenSymbol}
            amount={amount}
            amountUsd={amountUsd}
          />
        ),
      )}
      {showsDistributor && (
        <DistributorRewards claim={claim} accrued={accrued} />
      )}
      <Flex justify="space-between" align="center" gap="m">
        <Text fs="p3" color={getToken("text.medium")}>
          {t("borrow:summary.totalWorth")}
        </Text>
        <Text fs="p3" fw={600}>
          {t("currency", {
            value: totalUsd.toString(),
            maximumFractionDigits: 2,
          })}
        </Text>
      </Flex>
      <AuthorizedAction size="large" width="100%">
        <LoadingButton
          width="100%"
          size="large"
          disabledVariant="muted"
          isLoading={isClaiming}
          // until the rewards are read, the controller's part cannot be built
          disabled={isPending || (!toClaim.controller && !toClaim.distributor)}
          onClick={() => onClaim(toClaim)}
        >
          {claimLabel}
        </LoadingButton>
      </AuthorizedAction>
    </Stack>
  )
}
