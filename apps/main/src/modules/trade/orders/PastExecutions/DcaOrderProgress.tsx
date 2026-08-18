import { Flex, ProgressBar, Text } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly percent: number
  readonly tradesLabel: string | null
}

export const DcaOrderProgress: FC<Props> = ({ percent, tradesLabel }) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" gap="xs" width="100%">
      <Flex
        justify={tradesLabel ? "space-between" : "flex-end"}
        align="baseline"
        gap="s"
      >
        {tradesLabel && (
          <Text fs="p4" fw={500} whiteSpace="nowrap">
            {tradesLabel}
          </Text>
        )}
        <Text fs="p4" fw={500} whiteSpace="nowrap">
          {t("percent", {
            value: percent,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Flex>
      <ProgressBar value={percent} hideLabel />
    </Flex>
  )
}
