import { ComponentProps, ComponentType, FC, Ref } from "react"

import { Flex } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { getToken, getTokenPx, px } from "@/utils"

type AmountVariant = "default" | "horizontalLabel" | "primary"
type AmountSize = "default" | "large"
type AmountColor = "default" | "tint"

type AmountProps = {
  readonly label?: string
  readonly labelIcon?: ComponentType
  readonly description?: string | ReadonlyArray<string>
  readonly value: string
  readonly displayValue?: string
  readonly variant?: AmountVariant
  readonly className?: string
  readonly size?: AmountSize
  readonly color?: AmountColor
}

export const Amount: FC<AmountProps> = ({
  label,
  labelIcon,
  description,
  value,
  displayValue,
  variant = "default",
  className,
  size = "default",
  color = "default",
}) => {
  return (
    <Flex
      className={className}
      direction={variant === "horizontalLabel" ? "row" : "column"}
      justify={variant === "horizontalLabel" ? "space-between" : undefined}
      align={
        variant === "horizontalLabel" && !!labelIcon ? "center" : undefined
      }
      gap={2}
    >
      <Flex direction="column" gap={2}>
        <Flex align="center" gap={getTokenPx("containers.paddings.quint")}>
          {labelIcon && (
            <Icon
              component={labelIcon}
              size={16}
              color={
                color === "default"
                  ? getToken("icons.onContainer")
                  : getToken("buttons.secondary.emphasis.onRest")
              }
            />
          )}
          {label && (
            <AmountLabel variant={variant} color={color} size={size}>
              {label}
            </AmountLabel>
          )}
        </Flex>
        {description &&
          (Array.isArray(description) ? description : [description]).map(
            (line, i) => (
              <Text key={i} fs={11} lh={px(12)} color={getToken("text.low")}>
                {line}
              </Text>
            ),
          )}
      </Flex>
      <Flex
        direction="column"
        gap={2}
        align={variant === "horizontalLabel" ? "flex-end" : undefined}
      >
        <AmountValue variant={variant} size={size}>
          {value}
        </AmountValue>
        {displayValue && (
          <AmountDisplayValue variant={variant}>
            {displayValue}
          </AmountDisplayValue>
        )}
      </Flex>
    </Flex>
  )
}

type AmountMediumLabelProps = ComponentProps<typeof Text> & {
  readonly variant?: AmountVariant
  readonly size?: AmountSize
  readonly ref?: Ref<HTMLParagraphElement>
}

const AmountLabel: FC<AmountMediumLabelProps> = ({
  variant = "default",
  color = "default",
  ...props
}) => {
  switch (variant) {
    case "horizontalLabel":
      return (
        <Text
          fs={13}
          lh={px(15)}
          color={
            color === "default"
              ? getToken("text.low")
              : getToken("text.tint.primary")
          }
          {...props}
        />
      )
    case "primary":
      return (
        <Text fs="p6" lh={1.4} color={getToken("text.medium")} {...props} />
      )
    case "default":
    default:
      return (
        <Text
          fs={12}
          lh={px(15)}
          color={
            color === "default"
              ? getToken("text.medium")
              : getToken("text.tint.primary")
          }
          {...props}
        />
      )
  }
}

type AmountValueProps = ComponentProps<typeof Text> & {
  readonly variant?: AmountVariant
  readonly ref?: HTMLParagraphElement
}

const AmountValue: FC<AmountValueProps> = ({
  variant = "default",
  size = "default",
  ...props
}) => {
  switch (variant) {
    case "horizontalLabel":
      return (
        <Text
          fw={600}
          fs={size === "large" ? "p2" : 12}
          lh={px(15)}
          color={getToken("text.high")}
          {...props}
        />
      )
    case "primary":
      return (
        <Text
          font="primary"
          fw={500}
          fs="h7"
          lh={1}
          color={getToken("text.high")}
          {...props}
        />
      )
    case "default":
    default:
      return (
        <Text
          fw={500}
          fs={size === "large" ? "p2" : "p4"}
          lh={1}
          color={getToken("text.high")}
          {...props}
        />
      )
  }
}

type AmountDisplayValueProps = ComponentProps<typeof Text> & {
  readonly variant?: AmountVariant
  readonly ref?: HTMLParagraphElement
}

const AmountDisplayValue: FC<AmountDisplayValueProps> = ({
  variant = "default",
  ...props
}) => {
  switch (variant) {
    case "horizontalLabel":
      return (
        <Text fs={11} lh={px(15)} color={getToken("text.low")} {...props} />
      )
    case "primary":
      return <Text fs={10} lh={1} color={getToken("text.low")} {...props} />
    case "default":
    default:
      return <Text fs={10} lh={1} color={getToken("text.low")} {...props} />
  }
}
