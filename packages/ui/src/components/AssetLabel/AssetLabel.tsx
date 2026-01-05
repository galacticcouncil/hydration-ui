import { FC, ReactNode } from "react"

import { LogoSize } from "@/components/Logo"
import { getToken, px } from "@/utils"

import { Flex } from "../Flex"
import { Skeleton } from "../Skeleton"
import { Text, TextProps } from "../Text"

type AssetLabelVariant = Extract<LogoSize, "medium" | "large"> | "primary"

export type AssetLabelProps = {
  name?: string
  symbol: string
  variant?: AssetLabelVariant
  loading?: boolean
  badge?: ReactNode
}

export const AssetLabel = ({
  name,
  symbol,
  variant = "medium",
  loading,
  badge,
}: AssetLabelProps) => {
  if (loading) {
    return (
      <div>
        <Skeleton width={32} height={12} />
        <Skeleton width={56} height={12} />
      </div>
    )
  }

  return (
    <Flex direction="column" gap={variant === "primary" ? 0 : 2} minWidth={0}>
      <Flex gap={4} align="center">
        <Symbol variant={variant}>{symbol}</Symbol>
        {badge}
      </Flex>
      {name && <Name variant={variant}>{name}</Name>}
    </Flex>
  )
}

const Symbol: FC<TextProps & { variant: AssetLabelVariant }> = ({
  variant,
  ...props
}) => {
  if (variant === "primary") {
    return (
      <Text
        font="primary"
        fs={22}
        fw={500}
        lh={px(24)}
        whiteSpace="nowrap"
        {...props}
      />
    )
  }

  return (
    <Text
      color={getToken("text.high")}
      fs={variant === "medium" ? "p5" : "p3"}
      fw={600}
      lh={1}
      whiteSpace="nowrap"
      {...props}
    />
  )
}

const Name: FC<TextProps & { variant: AssetLabelVariant }> = ({
  variant,
  ...props
}) => {
  return (
    <Text
      color={getToken("text.medium")}
      fs={variant === "medium" ? "p6" : "p5"}
      fw={400}
      lh={variant === "primary" ? 1.3 : 1}
      truncate
      {...props}
    />
  )
}
