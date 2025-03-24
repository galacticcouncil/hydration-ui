import { ComponentProps, FC, forwardRef } from "react"

import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import { getToken, px } from "@/utils"

type AmountVariant = "default" | "horizontalLabel" | "tokenLabel" | "small"

type AmountProps = {
  readonly label?: string
  readonly value: string | number
  readonly valueSymbol?: string
  readonly displayValue?: string
  readonly variant?: AmountVariant
  readonly className?: string
}

export const Amount: FC<AmountProps> = ({
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
      justify={variant === "horizontalLabel" ? "space-between" : undefined}
      gap={2}
    >
      {label && <AmountLabel variant={variant}>{label}</AmountLabel>}
      <Flex
        direction="column"
        gap={2}
        align={variant === "horizontalLabel" ? "flex-end" : undefined}
      >
        <AmountValue variant={variant}>
          {value} {valueSymbol}
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
}

const AmountLabel = forwardRef<HTMLParagraphElement, AmountMediumLabelProps>(
  ({ variant = "default", ...props }, ref) => {
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
  },
)

AmountLabel.displayName = "AmountLabel"

type AmountValueProps = ComponentProps<typeof Text> & {
  readonly variant?: AmountVariant
}

const AmountValue = forwardRef<HTMLParagraphElement, AmountValueProps>(
  ({ variant = "default", ...props }, ref) => {
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
  },
)

AmountValue.displayName = "AmountValue"

type AmountDisplayValueProps = ComponentProps<typeof Text> & {
  readonly variant?: AmountVariant
}

const AmountDisplayValue = forwardRef<
  HTMLParagraphElement,
  AmountDisplayValueProps
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

AmountDisplayValue.displayName = "AmountDisplayValue"
