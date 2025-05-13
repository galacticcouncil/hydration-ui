import { useMoneyMarketData } from "@galacticcouncil/money-market/hooks"
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
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorRisk } from "@/modules/borrow/healthfactor/HealthFactorRisk"

export const DashboardHeader = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { user, loading } = useMoneyMarketData()

  const [riskModalOpen, setRiskModalOpen] = useState(false)

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
                t("currency", { value: user.netWorthUSD })
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
              <SValueStatsValue
                size="large"
                sx={{ color: getToken("accents.alert.primary") }}
              >
                {loading ? (
                  <Skeleton width={50} />
                ) : user.healthFactor !== "-1" ? (
                  t("number", {
                    value: user.healthFactor,
                    maximumFractionDigits: 2,
                  })
                ) : (
                  "-"
                )}
              </SValueStatsValue>
              <Button
                disabled={loading}
                outline
                variant="danger"
                onClick={() => setRiskModalOpen(true)}
              >
                {t("borrow:risk.details")}
              </Button>
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
