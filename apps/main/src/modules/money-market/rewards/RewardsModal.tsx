import {
  useClaimableRewards,
  useMoneyMarket,
} from "@galacticcouncil/money-market/react"
import {
  Flex,
  LoadingButton,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  type RewardsDistributorAccrued,
  type RewardsDistributorClaim,
} from "@/api/rewardsDistributor"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { MIN_CLAIMABLE_INCENTIVES_USDT } from "@/modules/money-market/constants"
import { useUserAddress } from "@/modules/money-market/hooks"
import { reserveAssetId } from "@/modules/money-market/reserves/reserves"
import { DistributorRewards } from "@/modules/money-market/rewards/DistributorRewards"
import { hasDistributorRewards } from "@/modules/money-market/rewards/DistributorRewards.utils"
import { useClaimRewards } from "@/modules/money-market/rewards/RewardsModal.tx"
import { RewardsModalRow } from "@/modules/money-market/rewards/RewardsModalRow"

type RewardsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  claim: RewardsDistributorClaim
  accrued: RewardsDistributorAccrued
}

/**
 * The money market's own rewards and the rewards distributor's in one list,
 * claimed together. For the main market, the one the distributor pays on.
 */
export const RewardsModal: FC<RewardsModalProps> = ({
  open,
  onOpenChange,
  claim,
  accrued,
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const { market } = useMoneyMarket()
  const user = useUserAddress()
  const { data: claimable, isPending } = useClaimableRewards(user)

  // one entry per reward token that is worth anything
  const rewards = (claimable ?? []).filter(({ amountUsd }) =>
    Big(amountUsd).gt(0),
  )
  const controllerUsd = rewards.reduce(
    (sum, { amountUsd }) => sum.plus(amountUsd),
    Big(0),
  )
  const isControllerEmpty = controllerUsd.lt(MIN_CLAIMABLE_INCENTIVES_USDT)
  const isDistributorClaimable = claim.status === "claimable"
  const totalUsd = controllerUsd.plus(
    isDistributorClaimable ? claim.owedUsd : 0,
  )

  const { mutate, isPending: isClaiming } = useClaimRewards(isControllerEmpty)

  const onClaim = () => {
    onOpenChange(false)
    mutate()
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} variant="popup">
      <ModalHeader title={t("borrow:rewards.title")} />
      <ModalBody scrollable={false}>
        {/* a flat list: the window is the only box */}
        <Stack separated separator={<ModalContentDivider />} gap="l">
          <Flex justify="space-between" gap="m">
            <Text fs="p6" fw={500} color={getToken("text.low")}>
              {t("asset")}
            </Text>
            <Text fs="p6" fw={500} color={getToken("text.low")}>
              {t("balance")}
            </Text>
          </Flex>
          {rewards.map(
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
          {hasDistributorRewards(claim, accrued) && (
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
              disabled={
                isPending || (isControllerEmpty && !isDistributorClaimable)
              }
              onClick={onClaim}
            >
              {t("borrow:claim")}
            </LoadingButton>
          </AuthorizedAction>
        </Stack>
      </ModalBody>
    </Modal>
  )
}
