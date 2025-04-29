import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"
import { isNullish } from "remeda"

import { isNegative } from "@/utils/formatting"

import { STradeOptionContainer } from "./TradeOption.styled"

export const TradeOption = ({
  id,
  label,
  time,
  active,
  value,
  displayValue,
  diff,
  onClick,
}: {
  id: string
  label: string
  time: string
  active: boolean
  value: string
  displayValue: string
  diff?: string
  onClick: (id: string) => void
}) => {
  const { t } = useTranslation()

  return (
    <STradeOptionContainer
      type="button"
      onClick={() => onClick(id)}
      active={active}
    >
      <Flex direction="column">
        <Text fs={14} lh={1} color={getToken("text.high")}>
          {label}
        </Text>
        <Text fs="p5" color={getToken("text.medium")}>
          {time}
        </Text>
      </Flex>
      <Flex direction="column" align="end">
        <Text fs={14} lh={1} fw={600} color={getToken("text.high")}>
          {t("currency", {
            value: value,
            symbol: "HDX",
          })}
        </Text>
        <Flex gap={4} align="center">
          <Text fs="p6" fw={400} color={getToken("text.medium")}>
            {t("currency", {
              value: displayValue,
            })}
          </Text>
          {!isNullish(diff) && (
            <Text
              fs="p6"
              fw={600}
              color={
                isNegative(diff)
                  ? getToken("accents.danger.emphasis")
                  : getToken("accents.success.emphasis")
              }
            >
              {t("currency", {
                prefix: "(",
                value: diff,
                signDisplay: "always",
                suffix: ")",
              })}
            </Text>
          )}
        </Flex>
      </Flex>
    </STradeOptionContainer>
  )
}
