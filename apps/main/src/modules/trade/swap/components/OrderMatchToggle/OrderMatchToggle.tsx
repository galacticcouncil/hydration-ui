import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Text,
  Toggle,
  ToggleLabel,
  ToggleRoot,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { millisecondsToMinutes } from "date-fns"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { ORDER_MATCH_WINDOW_MS } from "@/modules/trade/swap/lib/orderMatch"

type OrderMatchToggleProps = {
  readonly checked: boolean
  readonly disabled?: boolean
  readonly onCheckedChange: (checked: boolean) => void
}

export const OrderMatchToggle: FC<OrderMatchToggleProps> = ({
  checked,
  disabled = false,
  onCheckedChange,
}) => {
  const { t } = useTranslation("trade")

  const color =
    checked && !disabled
      ? getToken("text.tint.secondary")
      : getToken("text.low")

  return (
    <Flex justify="space-between" align="center" py="base">
      <Text fw={400} fs="p5" color={getToken("text.medium")}>
        {t("intent.orderMatch")}
      </Text>
      <Flex align="center" gap="base">
        <ToggleRoot>
          <Tooltip
            side="top"
            asChild
            text={t("intent.orderMatch.tooltip", {
              count: millisecondsToMinutes(ORDER_MATCH_WINDOW_MS),
            })}
          >
            <ToggleLabel htmlFor="orderMatch">
              <Flex align="center" gap="s">
                <Icon component={CircleInfo} size="s" color={color} />
                <Text fw={500} fs="p5" color={color}>
                  {t("intent.orderMatch.enabled")}
                </Text>
              </Flex>
            </ToggleLabel>
          </Tooltip>
          <Toggle
            aria-label={t("intent.orderMatch")}
            name="orderMatch"
            checked={checked}
            disabled={disabled}
            onCheckedChange={(value) => onCheckedChange(!!value)}
          />
        </ToggleRoot>
      </Flex>
    </Flex>
  )
}
