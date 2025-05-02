import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import {
  SContainer,
  SCurrentValueMarker,
  SCurrentValueWrapper,
  SLiquidationMarker,
  SLiquidationMarkerContainer,
  SScaleBar,
  SScaleBarFill,
  SScaleBarStripes,
  SValue,
} from "@/modules/borrow/healthfactor/HealthFactorLtvScale.styled"

interface LTVContentProps {
  loanToValue: string
  currentLoanToValue: string
  currentLiquidationThreshold: string
  color: string
}

export const HealthFactorLtvScale = ({
  loanToValue,
  currentLoanToValue,
  currentLiquidationThreshold,
  color,
}: LTVContentProps) => {
  const { t } = useTranslation(["borrow"])

  const ltvPercent = Number(loanToValue) * 100
  const currentLtvPercent = Number(currentLoanToValue) * 100

  const liquidationThresholdPercent = Number(currentLiquidationThreshold) * 100

  return (
    <SContainer>
      <SLiquidationMarkerContainer
        sx={{
          left: `${Math.min(liquidationThresholdPercent, 100)}%`,
        }}
      >
        <SLiquidationMarker>
          <SValue placement="bottom">
            <Stack pr={`${Math.min(liquidationThresholdPercent, 100)}%`}>
              <Text
                fs="p4"
                lh={1}
                align="right"
                color={getToken("details.values.negative")}
              >
                {liquidationThresholdPercent.toFixed(2)}%
              </Text>
              <Text
                fs="p4"
                color={getToken("details.values.negative")}
                align="right"
                sx={{ whiteSpace: "nowrap" }}
              >
                {t("borrow:risk.liquidationThreshold")}
              </Text>
            </Stack>
          </SValue>
        </SLiquidationMarker>
      </SLiquidationMarkerContainer>
      <SCurrentValueWrapper sx={{ left: `${Math.min(ltvPercent, 100)}%` }}>
        <SCurrentValueMarker>
          <SValue placement="top">
            <Text fs="p4" fw={600}>
              {(Number(loanToValue) * 100).toFixed(2)}%
            </Text>
            <Flex inline gap={4} color={getToken("text.medium")}>
              <Text fs="p6">MAX</Text>
              <Text fs="p6">
                {(Number(currentLoanToValue) * 100).toFixed(2)}%
              </Text>
            </Flex>
          </SValue>
        </SCurrentValueMarker>
      </SCurrentValueWrapper>
      <SScaleBar>
        <SScaleBarFill width={`${Math.min(ltvPercent, 100)}%`} color={color} />
        {ltvPercent < currentLtvPercent && (
          <SScaleBarStripes
            color={color}
            width={`${Math.min(currentLtvPercent, 100)}%`}
          />
        )}
      </SScaleBar>
    </SContainer>
  )
}
