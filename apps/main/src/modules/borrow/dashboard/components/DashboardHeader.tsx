import {
  useClaimableRewards,
  useFormattedHealthFactor,
  useModalContext,
  useMoneyMarketData,
} from "@galacticcouncil/money-market/hooks"
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

import { HealthFactorRisk } from "@/modules/borrow/healthfactor/HealthFactorRisk"

export const DashboardHeader = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { user, isConnected, loading } = useMoneyMarketData()
  const { openClaimRewards } = useModalContext()

  const [riskModalOpen, setRiskModalOpen] = useState(false)

  const { claimableRewardsUsd } = useClaimableRewards()

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
        gap={[10, null, 40, 60]}
        separated
      >
        <ValueStats
          isLoading={loading}
          label={t("borrow:netWorth")}
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
          isLoading={loading}
          label={t("borrow:netApy")}
          value={
            isConnected
              ? t("percent", {
                  value: user.netAPY * 100,
                })
              : "-"
          }
          size="large"
        />
        <ValueStats
          label={t("borrow:healthFactor")}
          customValue={
            <Flex align="center" gap={10}>
              <SValueStatsValue size="large" sx={{ color: healthFactorColor }}>
                {loading ? (
                  <Skeleton width={50} />
                ) : isHealthFactorValid ? (
                  t("number", {
                    value: healthFactor,
                    maximumFractionDigits: 2,
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
          size="large"
        />

        {Big(claimableRewardsUsd).gte(0.01) && (
          <ValueStats
            label={t("borrow:availableRewards")}
            customValue={
              <SValueStatsValue size="large">
                {loading ? (
                  <Skeleton width={100} />
                ) : (
                  <Flex align="center" gap={10}>
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
        <ModalBody>
          <HealthFactorRisk />
        </ModalBody>
      </Modal>
    </>
  )
}
