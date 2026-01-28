import { FC, ReactNode } from "react"

import { LogoSize } from "@/components/Logo"
import { getToken } from "@/utils"

import { Flex } from "../Flex"
import { Skeleton } from "../Skeleton"
import { Text, TextProps } from "../Text"

type AssetLabelSize = Extract<LogoSize, "medium" | "large"> | "primary"

export type AssetLabelProps = {
  name?: string
  symbol: string
  size?: AssetLabelSize
  loading?: boolean
  badge?: ReactNode
}

export const AssetLabel = ({
  name,
  symbol,
  size = "medium",
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
    <Flex direction="column" gap={size === "primary" ? 0 : 2} minWidth={0}>
      <Flex gap="s" align="center">
        <Symbol size={size}>{symbol}</Symbol>
        {badge}
      </Flex>
      {name && <Name size={size}>{name}</Name>}
    </Flex>
  )
}

const Symbol: FC<TextProps & { size: AssetLabelSize }> = ({
  size,
  ...props
}) => {
  if (size === "primary") {
    return (
      <Text
        font="primary"
        fs="h6"
        fw={500}
        lh="xl"
        whiteSpace="nowrap"
        {...props}
      />
    )
  }

  return (
    <Text
      color={getToken("text.high")}
      fs={size === "medium" ? "p5" : "p3"}
      fw={600}
      lh={1}
      whiteSpace="nowrap"
      {...props}
    />
  )
}

const Name: FC<TextProps & { size: AssetLabelSize }> = ({ size, ...props }) => {
  return (
    <Text
      color={getToken("text.medium")}
      fs={size === "medium" ? "p6" : "p5"}
      fw={400}
      lh={size === "primary" ? 1.3 : 1}
      truncate
      {...props}
    />
  )
}
