import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC, Fragment } from "react"
import { useTranslation } from "react-i18next"

import { HEALTH_FACTOR_RISK_THRESHOLD } from "@/modules/money-market/constants"
import {
  HealthFactorNumber,
  toDisplayedHealthFactor,
} from "@/modules/money-market/HealthFactorNumber"

type Props = {
  readonly current?: string
  readonly intermediate?: string
  readonly projected?: string
  readonly isLoading?: boolean
}

/**
 * `current → intermediate → projected`, each arrow only once the value changes
 * at 2 decimals; below the risk threshold, the liquidation line.
 */
export const HealthFactorChange: FC<Props> = ({
  current,
  intermediate,
  projected,
  isLoading,
}) => {
  const { t } = useTranslation("borrow")

  if (isLoading || current === undefined) {
    return <Skeleton width={80} height="1em" />
  }

  const steps = [current, intermediate, projected].reduce<string[]>(
    (acc, value) => {
      const last = acc.at(-1)
      return value === undefined ||
        (last !== undefined &&
          toDisplayedHealthFactor(last) === toDisplayedHealthFactor(value))
        ? acc
        : [...acc, value]
    },
    [],
  )

  const final = projected ?? current
  const isBelowRiskThreshold =
    toDisplayedHealthFactor(final) !== "∞" &&
    Big(final).lt(HEALTH_FACTOR_RISK_THRESHOLD)

  return (
    <Flex direction="column" align="flex-end">
      <Flex gap="s" align="center">
        {steps.map((value, index) => (
          <Fragment key={index}>
            {index > 0 && <Icon component={ArrowRight} size="s" />}
            <Text fs="p5" fw={500}>
              <HealthFactorNumber value={value} />
            </Text>
          </Fragment>
        ))}
      </Flex>
      {isBelowRiskThreshold && (
        <Text fs="p6" lh={1} color={getToken("text.low")}>
          {t("healthFactor.liquidationAt")}
        </Text>
      )}
    </Flex>
  )
}
