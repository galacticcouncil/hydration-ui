import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { SFloatingValue } from "@/modules/borrow/healthfactor/HealthFactorRiskInfo.styled"
import {
  SContainer,
  SCurrentValueMarker,
  SCurrentValueWrapper,
  SHealthFactorBar,
  SLiquidationMarker,
} from "@/modules/borrow/healthfactor/HealthFactorRiskScale.styled"

interface HFContentProps {
  healthFactor: string
}

export const HealthFactorRiskScale = ({ healthFactor }: HFContentProps) => {
  const { t } = useTranslation(["borrow"])
  const formattedHealthFactor = Number(
    Big(healthFactor).toFixed(2, Big.roundDown),
  )

  const position = +healthFactor > 10 ? 100 : +healthFactor * 10
  const liqudationThreshold = 1

  return (
    <SContainer>
      <SHealthFactorBar />
      <SCurrentValueWrapper position={position}>
        <SCurrentValueMarker position={position}>
          <SFloatingValue
            placement="top"
            align={position <= 5 ? "left" : position >= 95 ? "right" : "center"}
          >
            {formattedHealthFactor}
          </SFloatingValue>
        </SCurrentValueMarker>
      </SCurrentValueWrapper>
      <SLiquidationMarker>
        <Stack pl={`calc(${liqudationThreshold * 10}% - 10px)`}>
          <Text fs={13} lh={1} color={getToken("details.values.negative")}>
            1.00
          </Text>
          <Text
            fs={13}
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
