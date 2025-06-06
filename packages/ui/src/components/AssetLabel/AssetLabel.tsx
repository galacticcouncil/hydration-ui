import { ReactNode } from "react"

import { getToken } from "@/utils"

import { Flex } from "../Flex"
import { Skeleton } from "../Skeleton"
import { Text } from "../Text"

type AssetLabelSize = "large" | "medium"

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
  const isMedium = size === "medium"

  if (loading) {
    return (
      <div>
        <Skeleton width={32} height={12} />
        <Skeleton width={56} height={12} />
      </div>
    )
  }

  return (
    <Flex sx={{ flexDirection: "column", gap: 2 }}>
      {badge ? (
        <Flex sx={{ gap: 4 }} alignItems="center">
          <Text
            color={getToken("text.high")}
            fs={isMedium ? "p5" : "p3"}
            fw={600}
            lh={1}
            whiteSpace="nowrap"
          >
            {symbol}
          </Text>
          {badge}
        </Flex>
      ) : (
        <Text
          color={getToken("text.high")}
          fs={isMedium ? "p5" : "p3"}
          fw={600}
          lh={1}
          whiteSpace="nowrap"
        >
          {symbol}
        </Text>
      )}

      {name && (
        <Text
          color={getToken("text.medium")}
          fs={isMedium ? "p6" : "p5"}
          fw={400}
          lh={1}
          truncate={100}
        >
          {name}
        </Text>
      )}
    </Flex>
  )
}
