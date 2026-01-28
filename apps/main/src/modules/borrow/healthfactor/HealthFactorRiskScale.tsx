import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { SFloatingValue } from "@/modules/borrow/healthfactor/HealthFactorRiskInfo.styled"
import {
  SContainer,
  SCurrentValueMarker,
  SCurrentValueWrapper,
  SHealthFactorBar,
  SLiquidationMarker,
} from "@/modules/borrow/healthfactor/HealthFactorRiskScale.styled"

type HealthFactorRiskScaleProps = {
  healthFactor: string
}

export const HealthFactorRiskScale: React.FC<HealthFactorRiskScaleProps> = ({
  healthFactor,
}) => {
  const { t } = useTranslation(["common", "borrow"])

  const position = +healthFactor > 10 ? 100 : +healthFactor * 10

  return (
    <SContainer>
      <SHealthFactorBar />
      <SCurrentValueWrapper position={position}>
        <SCurrentValueMarker position={position}>
          <SFloatingValue
            placement="top"
            align={position <= 5 ? "left" : position >= 95 ? "right" : "center"}
          >
            <Text fs="p4" fw={600}>
              {t("number", {
                value: healthFactor,
                maximumFractionDigits: 2,
                notation: "compact",
              })}
            </Text>
          </SFloatingValue>
        </SCurrentValueMarker>
      </SCurrentValueWrapper>
      <SLiquidationMarker>
        <Stack pl="calc(10% - 10px)">
          <Text fs="p4" lh={1} color={getToken("details.values.negative")}>
            1.00
          </Text>
          <Text
            fs="p4"
            color={getToken("details.values.negative")}
            sx={{ whiteSpace: "nowrap" }}
          >
            {t("borrow:risk.liquidationValue")}
          </Text>
        </Stack>
      </SLiquidationMarker>
    </SContainer>
  )
}
