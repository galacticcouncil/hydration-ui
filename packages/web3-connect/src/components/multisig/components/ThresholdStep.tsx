import {
  Alert,
  Button,
  Flex,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { SThresholdStepContainer } from "@/components/multisig/components/ThresholdStep.styled"

type ThresholdStepProps = {
  validSignerCount: number
  threshold: number
  onThresholdChange: (n: number) => void
  onContinue: () => void
}

export const ThresholdStep: React.FC<ThresholdStepProps> = ({
  validSignerCount,
  threshold,
  onThresholdChange,
  onContinue,
}) => {
  const { t } = useTranslation()

  return (
    <Stack gap="m" p="xl" pt={0}>
      <Flex gap="xl" align="center">
        <SThresholdStepContainer>
          {Array.from({ length: validSignerCount }, (_, i) => {
            const n = i + 1
            const isActive = n <= threshold
            return (
              <Button
                key={n}
                variant={isActive ? "accent" : "muted"}
                outline
                onClick={() => onThresholdChange(n)}
                flex={1}
              >
                {n}
              </Button>
            )
          })}
        </SThresholdStepContainer>

        <Text fs="p4" fw={600} color={getToken("text.tint.quart")}>
          {t("multisig.setup.thresholdSuffix", {
            threshold,
            count: validSignerCount,
          })}
        </Text>
      </Flex>

      {threshold === 1 ? (
        <Alert variant="error" title={t("multisig.setup.warning.threshold1")} />
      ) : threshold === validSignerCount ? (
        <Alert
          variant="warning"
          title={t("multisig.setup.warning.thresholdAll", { threshold })}
        />
      ) : (
        <Alert
          variant="success"
          title={t("multisig.setup.warning.thresholdBalanced", {
            threshold,
            count: validSignerCount,
          })}
        />
      )}

      <Button
        variant="secondary"
        size="large"
        type="button"
        onClick={onContinue}
        width="100%"
        sx={{ mt: "s" }}
      >
        {t("multisig.setup.new.continueToName")}
      </Button>
    </Stack>
  )
}
