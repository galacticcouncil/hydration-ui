import { useFormattedLtv } from "@galacticcouncil/money-market/hooks"
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
} from "@/modules/borrow/healthfactor/HealthFactorLtvScale.styled"
import { SFloatingValue } from "@/modules/borrow/healthfactor/HealthFactorRiskInfo.styled"

type LTVContentProps = {
  loanToValue: string
  currentLoanToValue: string
  currentLiquidationThreshold: string
} & ReturnType<typeof useFormattedLtv>

export const HealthFactorLtvScale = ({
  loanToValue,
  currentLoanToValue,
  currentLtvPercent,
  liquidationThresholdPercent,
  ltvColor,
  ltvPercent,
}: LTVContentProps) => {
  const { t } = useTranslation(["borrow"])

  return (
    <SContainer>
      <SLiquidationMarkerContainer
        sx={{
          left: `${Math.min(liquidationThresholdPercent, 100)}%`,
        }}
      >
        <SLiquidationMarker>
          <SFloatingValue placement="bottom" align="right">
            <Stack>
              <Text fs="p4" lh={1} color={getToken("details.values.negative")}>
                {liquidationThresholdPercent.toFixed(2)}%
              </Text>
              <Text
                fs="p4"
                color={getToken("details.values.negative")}
                sx={{ whiteSpace: "nowrap" }}
              >
                {t("borrow:risk.liquidationThreshold")}
              </Text>
            </Stack>
          </SFloatingValue>
        </SLiquidationMarker>
      </SLiquidationMarkerContainer>
      <SCurrentValueWrapper sx={{ left: `${Math.min(ltvPercent, 100)}%` }}>
        <SCurrentValueMarker>
          <SFloatingValue
            placement="top"
            align={
              ltvPercent <= 5 ? "left" : ltvPercent >= 95 ? "right" : "center"
            }
          >
            <Text fs="p4" fw={600}>
              {(Number(loanToValue) * 100).toFixed(2)}%
            </Text>
            <Flex inline gap={4} color={getToken("text.medium")}>
              <Text fs="p6">MAX</Text>
              <Text fs="p6">
                {(Number(currentLoanToValue) * 100).toFixed(2)}%
              </Text>
            </Flex>
          </SFloatingValue>
        </SCurrentValueMarker>
      </SCurrentValueWrapper>
      <SScaleBar>
        <SScaleBarFill
          $width={`${Math.min(ltvPercent, 100)}%`}
          $color={ltvColor}
        />
        {ltvPercent < currentLtvPercent && (
          <SScaleBarStripes
            $color={ltvColor}
            $width={`${Math.min(currentLtvPercent, 100)}%`}
          />
        )}
      </SScaleBar>
    </SContainer>
  )
}
