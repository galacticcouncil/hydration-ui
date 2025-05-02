import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  Separator,
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

  const [riskModalOpen, setRiskModalOpen] = useState(false)

  return (
    <>
      <Stack direction={["column", "row"]} justify="flex-start" gap={[0, 40]}>
        <ValueStats
          label={t("borrow:netWorth")}
          value={t("common:currency", { value: 1000000 })}
          size="large"
        />
        <Separator orientation="vertical" sx={{ my: 10 }} />
        <ValueStats
          label={t("borrow:netApy")}
          value={t("common:currency", { value: 1000000 })}
          size="large"
        />
        <Separator orientation="vertical" sx={{ my: 10 }} />
        <ValueStats
          label={t("borrow:healthFactor")}
          customValue={
            <Flex align="center" gap={10}>
              <SValueStatsValue
                size="large"
                sx={{ color: getToken("accents.danger.emphasis") }}
              >
                1.25
              </SValueStatsValue>
              <Button
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
