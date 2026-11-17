import {
  Flex,
  LoadingButton,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useUserBorrowSummary } from "@/api/borrow"
import {
  type RewardsDistributorAccrued,
  type RewardsDistributorClaim,
} from "@/api/rewardsDistributor"
import { AssetLogo } from "@/components/AssetLogo"
import { DistributorRewards } from "@/modules/borrow/dashboard/components/DistributorRewards"
import { hasDistributorRewards } from "@/modules/borrow/dashboard/components/DistributorRewards.utils"
import { useClaimRewards } from "@/modules/borrow/dashboard/components/RewardsModal.tx"
import {
  getControllerRewards,
  getRewardsTotalUsd,
  MIN_CLAIMABLE_INCENTIVES_USDT,
} from "@/modules/borrow/dashboard/components/RewardsModal.utils"

type RewardsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  claim: RewardsDistributorClaim
  accrued: RewardsDistributorAccrued
}

/**
 * The money market's own rewards and the rewards distributor's in one list,
 * claimed together.
 */
export const RewardsModal: FC<RewardsModalProps> = ({
  open,
  onOpenChange,
  claim,
  accrued,
}) => {
  const { t } = useTranslation(["common", "borrow"])
  // the summary the controller's claim is built from, so both agree
  const { data: user, isLoading } = useUserBorrowSummary()

  const rewards = useMemo(
    () => (user ? getControllerRewards(user.calculatedUserIncentives) : []),
    [user],
  )
  const controllerUsd = getRewardsTotalUsd(rewards)
  const isControllerEmpty = controllerUsd.lt(MIN_CLAIMABLE_INCENTIVES_USDT)
  const isDistributorClaimable = claim.status === "claimable"
  const totalUsd = controllerUsd.plus(
    isDistributorClaimable ? claim.owedUsd : 0,
  )

  const { mutate, isPending } = useClaimRewards(isControllerEmpty)

  const onClaim = () => {
    onOpenChange(false)
    mutate()
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader title={t("borrow:rewards.title")} />
      <ModalBody scrollable={false}>
        <TableContainer
          borderStyle="solid"
          borderWidth={1}
          borderColor={getToken("details.separators")}
          borderRadius="m"
        >
          <Table size="small">
            <TableHeader>
              <TableRow>
                <TableHead>{t("asset")}</TableHead>
                <TableHead sx={{ textAlign: "end" }}>{t("balance")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map(
                ({ rewardTokenAddress, symbol, balance, balanceUsd }) => (
                  <TableRow key={rewardTokenAddress}>
                    <TableCell>
                      <Flex align="center" gap="s">
                        <AssetLogo
                          id={getAssetIdFromAddress(rewardTokenAddress)}
                        />
                        <Text fs="p3" fw={600}>
                          {symbol}
                        </Text>
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <Flex direction="column" align="flex-end">
                        <Text fs="p4" fw={500}>
                          {t("currency", { value: balance, symbol })}
                        </Text>
                        <Text fs="p5" lh={1} color={getToken("text.medium")}>
                          {t("currency", {
                            value: balanceUsd,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </Flex>
                    </TableCell>
                  </TableRow>
                ),
              )}
              {hasDistributorRewards(claim, accrued) && (
                <DistributorRewards claim={claim} accrued={accrued} />
              )}
              <TableRow>
                <TableCell>
                  <Text fs="p3" fw={600}>
                    {t("borrow:rewards.total")}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text fs="p3" fw={600} align="right">
                    {t("currency", {
                      value: totalUsd.toString(),
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <LoadingButton
          mt="var(--modal-content-padding)"
          width="100%"
          size="large"
          disabledVariant="muted"
          isLoading={isPending}
          // until the summary is in, the controller's part cannot be built
          disabled={isLoading || (isControllerEmpty && !isDistributorClaimable)}
          onClick={onClaim}
        >
          {t("borrow:claim")}
        </LoadingButton>
      </ModalBody>
    </Modal>
  )
}
