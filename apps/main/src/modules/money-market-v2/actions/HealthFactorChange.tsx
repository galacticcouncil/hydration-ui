import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Skeleton, Text } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly current?: string
  readonly projected?: string
  readonly isLoading?: boolean
}

/** v2 reports "-1" when there is no debt, i.e. the health factor is unbounded. */
const UNBOUNDED = "-1"

const toDisplayed = (value: string) =>
  value === UNBOUNDED ? "∞" : Big(value).toFixed(2, Big.roundDown)

/** `current → projected`, the arrow only once the change shows at 2 decimals. */
export const HealthFactorChange: FC<Props> = ({
  current,
  projected,
  isLoading,
}) => {
  const { t } = useTranslation()

  if (isLoading || current === undefined) {
    return <Skeleton width={80} height="1em" />
  }

  const format = (value: string) =>
    value === UNBOUNDED
      ? toDisplayed(value)
      : t("number", { value: toDisplayed(value) })

  const changes =
    projected !== undefined && toDisplayed(projected) !== toDisplayed(current)

  return (
    <Flex gap="s" align="center">
      <Text fs="p5" fw={500}>
        {format(current)}
      </Text>
      {changes && (
        <>
          <Icon component={ArrowRight} size="s" />
          <Text fs="p5" fw={500}>
            {format(projected)}
          </Text>
        </>
      )}
    </Flex>
  )
}
