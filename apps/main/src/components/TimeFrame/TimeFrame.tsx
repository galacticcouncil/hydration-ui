import {
  TimeFrame as TimeFrameModel,
  TimeFrameType,
  timeFrameTypes,
} from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { NumberInput, Select, SelectItem } from "@galacticcouncil/ui/components"
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
          variant="transparent"
          size="micro"
          onValueChange={(type) =>
            onChange(
              produce(timeFrame, (draft) => {
                draft.type = type
              }),
            )
          }
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
          }}
        />
      }
    />
  )
}
