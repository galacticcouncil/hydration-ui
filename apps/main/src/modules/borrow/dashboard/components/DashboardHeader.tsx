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

import { useApyContext } from "@/modules/borrow/context/ApyContext"
import { HealthFactorRisk } from "@/modules/borrow/healthfactor/HealthFactorRisk"

export const MIN_CLAIMABLE_INCENTIVES_USDT = 0.01

export const DashboardHeader = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { user, isConnected, loading } = useMoneyMarketData()
  const { openClaimRewards } = useModalContext()
  const { isLoading: isApyLoading } = useApyContext()

  const [riskModalOpen, setRiskModalOpen] = useState(false)

  const { claimableRewardsUsd } = getUserClaimableRewards(user)

  const {
    healthFactor,
    healthFactorColor,
    isHealthFactorValid,
    healthFactorLevel,
  } = useFormattedHealthFactor(user.healthFactor)

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
          value={
            isConnected
              ? t("percent", {
                  value: user.netAPY * 100,
                })
              : "-"
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

        {Big(claimableRewardsUsd).gte(MIN_CLAIMABLE_INCENTIVES_USDT) && (
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
                      value: claimableRewardsUsd,
                    })}
                    <Button onClick={() => openClaimRewards()}>
                      {t("borrow:claim")}
                    </Button>
                  </Flex>
                )}
              </SValueStatsValue>
            }
          />
        )}
      </Stack>
      <Modal open={riskModalOpen} onOpenChange={setRiskModalOpen}>
        <ModalHeader align="center" title={t("borrow:risk.title")} />
        <ModalBody scrollable={false}>
          <HealthFactorRisk />
        </ModalBody>
      </Modal>
    </>
  )
}
