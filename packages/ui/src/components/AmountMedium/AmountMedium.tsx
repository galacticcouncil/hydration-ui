import { ComponentProps, FC, forwardRef } from "react"

import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import { getToken, px } from "@/utils"

type AmountMediumVariant =
  | "default"
  | "horizontalLabel"
  | "tokenLabel"
  | "small"

type AmountMediumProps = {
  readonly label?: string
  readonly value: string | number
  readonly valueSymbol?: string
  readonly displayValue?: string
  readonly variant?: AmountMediumVariant
  readonly className?: string
}

export const AmountMedium: FC<AmountMediumProps> = ({
  label,
  value,
  valueSymbol,
  displayValue,
  variant = "default",
  className,
}) => {
  return (
    <Flex
      className={className}
      direction={variant === "horizontalLabel" ? "row" : "column"}
      justify={variant === "horizontalLabel" ? "space-between" : "flex-start"}
      gap={2}
    >
      {label && (
        <AmountMediumLabel variant={variant}>{label}</AmountMediumLabel>
      )}
      <Flex
        direction="column"
        gap={2}
        align={variant === "horizontalLabel" ? "flex-end" : "flex-start"}
      >
        <AmountMediumValue variant={variant}>
          {value} {valueSymbol}
        </AmountMediumValue>
        {displayValue && (
          <AmountMediumDisplayValue variant={variant}>
            {displayValue}
          </AmountMediumDisplayValue>
        )}
      </Flex>
    </Flex>
  )
}

type AmountMediumLabelProps = ComponentProps<typeof Text> & {
  readonly variant?: AmountMediumVariant
}

const AmountMediumLabel = forwardRef<
  HTMLParagraphElement,
  AmountMediumLabelProps
>(({ variant = "default", ...props }, ref) => {
  return variant === "default" ? (
    <Text
      ref={ref}
      fs={12}
      lh={px(15)}
      color={getToken("text.medium")}
      {...props}
    />
  ) : (
    <Text
      ref={ref}
      fs={13}
      lh={px(15)}
      color={getToken("text.low")}
      {...props}
    />
  )
})

AmountMediumLabel.displayName = "AmountMediumLabel"

type AmountMediumValueProps = ComponentProps<typeof Text> & {
  readonly variant?: AmountMediumVariant
}

const AmountMediumValue = forwardRef<
  HTMLParagraphElement,
  AmountMediumValueProps
>(({ variant = "default", ...props }, ref) => {
  return variant === "default" ? (
    <Text
      ref={ref}
      fw={500}
      fs="p4"
      lh={1}
      color={getToken("text.high")}
      {...props}
    />
  ) : (
    <Text
      ref={ref}
      fw={600}
      fs={12}
      lh={px(15)}
      color={getToken("text.high")}
      {...props}
    />
  )
})

AmountMediumValue.displayName = "AmountMediumValue"

type AmountMediumDisplayValueProps = ComponentProps<typeof Text> & {
  readonly variant?: AmountMediumVariant
}

const AmountMediumDisplayValue = forwardRef<
  HTMLParagraphElement,
  AmountMediumDisplayValueProps
>(({ variant = "default", ...props }, ref) => {
  return variant === "default" ? (
    <Text ref={ref} fs={10} lh={1} color={getToken("text.low")} {...props} />
  ) : (
    <Text
      ref={ref}
      fs={11}
      lh={px(15)}
      color={getToken("text.low")}
      {...props}
    />
  )
})

AmountMediumDisplayValue.displayName = "AmountMediumDisplayValue"
