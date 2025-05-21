import {
  useFormattedHealthFactor,
  useMoneyMarketData,
} from "@galacticcouncil/money-market/hooks"
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  Separator,
  Skeleton,
  Stack,
  SValueStatsValue,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorRisk } from "@/modules/borrow/healthfactor/HealthFactorRisk"

export const DashboardHeader = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { user, loading } = useMoneyMarketData()

  const [riskModalOpen, setRiskModalOpen] = useState(false)

  const {
    healthFactor,
    healthFactorColor,
    isHealthFactorValid,
    healthFactorLevel,
  } = useFormattedHealthFactor(user.healthFactor)

  return (
    <>
      <Stack direction={["column", "row"]} justify="flex-start" gap={[0, 40]}>
        <ValueStats
          label={t("borrow:netWorth")}
          customValue={
            <SValueStatsValue size="large">
              {loading ? (
                <Skeleton width={100} />
              ) : (
                t("currency", {
                  value: user.netWorthUSD,
                  maximumFractionDigits: 2,
                })
              )}
            </SValueStatsValue>
          }
        />
        <Separator orientation="vertical" sx={{ my: 10 }} />
        <ValueStats
          label={t("borrow:netApy")}
          customValue={
            <SValueStatsValue size="large">
              {loading ? (
                <Skeleton width={50} />
              ) : (
                t("percent", {
                  value: user.netAPY * 100,
                })
              )}
            </SValueStatsValue>
          }
          size="large"
        />
        <Separator orientation="vertical" sx={{ my: 10 }} />
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
