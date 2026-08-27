import { RotateCw } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Trans, useTranslation } from "react-i18next"

import { StableBondsRolloverButton } from "@/modules/strategies/stable-bonds/components/StableBondsRolloverButton"
import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { useStableBondsRollover } from "@/modules/strategies/stable-bonds/hooks/useStableBondsRollover"

export const StableBondsRollover = () => {
  const { t } = useTranslation(["common", "strategies"])
  const config = useStableBondsConfig()

  const sourceBondId =
    Object.values(STABLE_BONDS).find(
      (bond) => bond.rollover?.toBondId === config.bondId,
    )?.bondId ?? ""

  const rollover = useStableBondsRollover(sourceBondId)

  if (!rollover?.apr) return null

  return (
    <Paper>
      <Flex align="center" p="xl" gap="base">
        <Icon
          component={RotateCw}
          color={getToken("buttons.primary.high.rest")}
          size={20}
        />
        <Text
          font="primary"
          fw={500}
          fs="h7"
          lh={1}
          color={getToken("text.high")}
        >
          {t("strategies:bonds.rollover.title", { value: rollover.apr })}
        </Text>
      </Flex>
      <Separator />
      <Flex direction="column" gap="xl" p="xl">
        <Text fs="p3" color={getToken("text.medium")}>
          <Trans
            t={t}
            i18nKey="strategies:bonds.rollover.description"
            components={[
              <Text
                key="better-rate"
                as="span"
                color={getToken("text.tint.secondary")}
              />,
            ]}
          />
        </Text>
        <StableBondsRolloverButton
          bondId={sourceBondId}
          size="large"
          width="100%"
        />
      </Flex>
    </Paper>
  )
}
