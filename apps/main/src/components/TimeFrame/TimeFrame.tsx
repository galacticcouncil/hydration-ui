import {
  TimeFrame as TimeFrameModel,
  TimeFrameType,
  timeFrameTypes,
} from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  NumberInput,
  Select,
  SelectItem,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { produce } from "immer"
import { FC, useRef } from "react"
import { useTranslation } from "react-i18next"

export type TimeFrameProps = {
  readonly timeFrame: TimeFrameModel
  readonly isError?: boolean
  readonly allowedTypes?: ReadonlySet<TimeFrameType>
  readonly className?: string
  readonly onChange: (timeFrame: TimeFrameModel) => void
}

export const TimeFrame: FC<TimeFrameProps> = ({
  timeFrame,
  isError,
  allowedTypes,
  className,
  onChange,
}) => {
  const { t } = useTranslation(["common"])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const formatTimeFrame = (type: TimeFrameType): string =>
    t(`timeFrame.${type}`, { count: timeFrame.value ?? 0 })

  const timeFrameOptions = (
    allowedTypes
      ? timeFrameTypes.filter((type) => allowedTypes.has(type))
      : timeFrameTypes
  ).map(
    (type): SelectItem<TimeFrameType> => ({
      key: type,
      label: formatTimeFrame(type).toUpperCase(),
    }),
  )

  return (
    <NumberInput
      ref={inputRef}
      className={className}
      value={timeFrame.value}
      decimalScale={0}
      allowNegative={false}
      isError={isError}
      keepInvalidInput
      onValueChange={({ floatValue }) => {
        onChange(
          produce(timeFrame, (draft) => {
            draft.value = floatValue ?? null
          }),
        )
      }}
      trailingElement={
        <Select
          items={timeFrameOptions}
          value={timeFrame.type}
          renderTrigger={() => (
            <Flex gap={2} align="center">
              <Text
                fw={500}
                fs={11}
                lh={px(15)}
                transform="uppercase"
                color={getToken("buttons.secondary.low.onRest")}
              >
                {formatTimeFrame(timeFrame.type)}
              </Text>
              <Icon
                component={ChevronDown}
                size={18}
                color={getToken("icons.onContainer")}
              />
            </Flex>
          )}
          onValueChange={(type) =>
            onChange(
              produce(timeFrame, (draft) => {
                draft.type = type
              }),
            )
          }
          onOpenChange={(open) => {
            if (!open) {
              // focus is removed when the popover is closed so we need to wait a tick after closing
              setTimeout(() => {
                inputRef.current?.focus()
              }, 0)
            }
          }}
        />
      }
    />
  )
}
