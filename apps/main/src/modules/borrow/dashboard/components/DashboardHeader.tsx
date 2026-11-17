import {
  useFormattedHealthFactor,
  useModalContext,
  useMoneyMarketData,
} from "@galacticcouncil/money-market/hooks"
import { getUserClaimableRewards } from "@galacticcouncil/money-market/utils"
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  Skeleton,
  Stack,
  SValueStatsValue,
  ValueStats,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import {
  useRewardsDistributorAccrued,
  useRewardsDistributorClaim,
} from "@/api/rewardsDistributor"
import { UnavailableApy } from "@/components/DetailedApy/UnavailableApy"
import { useApyContext } from "@/modules/borrow/context/ApyContext"
import { hasDistributorRewards } from "@/modules/borrow/dashboard/components/DistributorRewards.utils"
import { RewardsModal } from "@/modules/borrow/dashboard/components/RewardsModal"
import { MIN_CLAIMABLE_INCENTIVES_USDT } from "@/modules/borrow/dashboard/components/RewardsModal.utils"
import { HealthFactorRisk } from "@/modules/borrow/healthfactor/HealthFactorRisk"

export const DashboardHeader = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { user, isConnected, loading } = useMoneyMarketData()
  const { openClaimRewards } = useModalContext()
  const { isLoading: isApyLoading } = useApyContext()

  const [riskModalOpen, setRiskModalOpen] = useState(false)
  const [rewardsModalOpen, setRewardsModalOpen] = useState(false)

  const { claimableRewardsUsd } = getUserClaimableRewards(user)
  const distributorClaim = useRewardsDistributorClaim()
  const distributorAccrued = useRewardsDistributorAccrued()

  // The distributor's rewards share the controller's stat and button. With
  // them the button opens a window that lists both and claims them together.
  const hasDistributor = hasDistributorRewards(
    distributorClaim,
    distributorAccrued,
  )
  const isControllerEmpty = Big(claimableRewardsUsd).lt(
    MIN_CLAIMABLE_INCENTIVES_USDT,
  )
  const isDistributorClaimable = distributorClaim.status === "claimable"
  const availableRewardsUsd = Big(claimableRewardsUsd)
    .plus(isDistributorClaimable ? distributorClaim.owedUsd : 0)
    .toString()
  const hasClaimableRewards = !isControllerEmpty || isDistributorClaimable

  const {
    healthFactor,
    healthFactorColor,
    isHealthFactorValid,
    healthFactorLevel,
  } = useFormattedHealthFactor(isConnected ? user.healthFactor : "-1")

  return (
    <>
      <Stack
        direction={["column", null, "row"]}
        justify="flex-start"
        gap={["base", null, "xxxl", "3.75rem"]}
        separated
      >
        <ValueStats
          size="large"
          isLoading={loading}
          label={t("borrow:netWorth")}
          wrap={[false, false, true]}
          value={
            isConnected
              ? t("currency", {
                  value: user.netWorthUSD,
                  maximumFractionDigits: 2,
                })
              : "-"
          }
        />
        <ValueStats
          size="large"
          isLoading={loading || isApyLoading}
          label={t("borrow:netApy")}
          wrap={[false, false, true]}
          customValue={
            user.netAPY !== null ? (
              <SValueStatsValue size="large">
                {t("percent", {
                  value: user.netAPY * 100,
                })}
              </SValueStatsValue>
            ) : (
              <SValueStatsValue size="large">
                <UnavailableApy />
              </SValueStatsValue>
            )
          }
        />
        <ValueStats
          size="large"
          label={t("borrow:healthFactor")}
          wrap={[false, false, true]}
          customValue={
            <Flex align="center" gap="base">
              <SValueStatsValue size="large" sx={{ color: healthFactorColor }}>
                {loading ? (
                  <Skeleton width={50} />
                ) : isHealthFactorValid ? (
                  t("number", {
                    value: healthFactor,
                    maximumFractionDigits: 2,
                    notation: "compact",
                  })
                ) : (
                  "-"
                )}
              </SValueStatsValue>
              {isHealthFactorValid && (
                <Button
                  disabled={loading}
                  outline
                  variant={healthFactorLevel === "good" ? "success" : "danger"}
                  onClick={() => setRiskModalOpen(true)}
                >
                  {t("borrow:risk.details")}
                </Button>
              )}
            </Flex>
          }
        />

        {(!isControllerEmpty || hasDistributor) && (
          <ValueStats
            label={t("borrow:availableRewards")}
            wrap={[false, false, true]}
            customValue={
              <SValueStatsValue size="large">
                {loading ? (
                  <Skeleton width={100} />
                ) : (
                  <Flex align="center" gap="base">
                    {t("currency", {
                      value: availableRewardsUsd,
                    })}
                    {hasClaimableRewards ? (
                      <Button
                        onClick={() =>
                          hasDistributor
                            ? setRewardsModalOpen(true)
                            : openClaimRewards()
                        }
                      >
                        {t("borrow:claim")}
                      </Button>
                    ) : (
                      // rewards that are still accruing or waiting to be claimable
                      <Button
                        variant="secondary"
                        outline
                        onClick={() => setRewardsModalOpen(true)}
                      >
                        {t("details")}
                      </Button>
                    )}
                  </Flex>
                )}
              </SValueStatsValue>
            }
          />
        )}
      </Stack>
      {hasDistributor && (
        <RewardsModal
          open={rewardsModalOpen}
          onOpenChange={setRewardsModalOpen}
          claim={distributorClaim}
          accrued={distributorAccrued}
        />
      )}
      <Modal open={riskModalOpen} onOpenChange={setRiskModalOpen}>
        <ModalHeader align="center" title={t("borrow:risk.title")} />
        <ModalBody scrollable={false}>
          <HealthFactorRisk />
        </ModalBody>
      </Modal>
    </>
  )
}
