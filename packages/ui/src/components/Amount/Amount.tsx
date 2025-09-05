import { ComponentProps, FC, Ref } from "react"

import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import { getToken, px } from "@/utils"

type AmountVariant = "default" | "horizontalLabel" | "tokenLabel" | "small"
type AmountSize = "default" | "large"

type AmountProps = {
  readonly label?: string
  readonly value: string
  readonly displayValue?: string
  readonly variant?: AmountVariant
  readonly className?: string
  readonly size?: AmountSize
}

export const Amount: FC<AmountProps> = ({
  label,
  value,
  displayValue,
  variant = "default",
  className,
  size = "default",
}) => {
  return (
    <Flex
      className={className}
      direction={variant === "horizontalLabel" ? "row" : "column"}
      justify={variant === "horizontalLabel" ? "space-between" : undefined}
      gap={2}
    >
      {label && <AmountLabel variant={variant}>{label}</AmountLabel>}
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
  readonly ref?: Ref<HTMLParagraphElement>
}

const AmountLabel: FC<AmountMediumLabelProps> = ({
  variant = "default",
  ...props
}) => {
  return variant === "default" ? (
    <Text fs={12} lh={px(15)} color={getToken("text.medium")} {...props} />
  ) : (
    <Text fs={13} lh={px(15)} color={getToken("text.low")} {...props} />
  )
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
  return variant === "default" ? (
    <Text
      fw={500}
      fs={size === "large" ? "p2" : "p4"}
      lh={1}
      color={getToken("text.high")}
      {...props}
    />
  ) : (
    <Text
      fw={600}
      fs={size === "large" ? "p2" : 12}
      lh={px(15)}
      color={getToken("text.high")}
      {...props}
    />
  )
}

type AmountDisplayValueProps = ComponentProps<typeof Text> & {
  readonly variant?: AmountVariant
  readonly ref?: HTMLParagraphElement
}

const AmountDisplayValue: FC<AmountDisplayValueProps> = ({
  variant = "default",
  ...props
}) => {
  return variant === "default" ? (
    <Text fs={10} lh={1} color={getToken("text.low")} {...props} />
  ) : (
    <Text fs={11} lh={px(15)} color={getToken("text.low")} {...props} />
  )
}
