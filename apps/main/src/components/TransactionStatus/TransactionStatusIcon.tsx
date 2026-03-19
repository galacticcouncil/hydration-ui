import { PixelCheck, PixelX } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Spinner } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import React from "react"

import { TransactionStatusProps } from "./TransactionStatus"

type TransactionStatusIconProps = {
  status: TransactionStatusProps["status"]
}

export const TransactionStatusIcon: React.FC<TransactionStatusIconProps> = ({
  status,
}) => {
  if (status === "idle") return null

  if (status === "submitted") {
    return <Spinner size="3xl" />
  }

  return (
    <Flex
      size="3xl"
      justify="center"
      align="center"
      bg={
        status === "error"
          ? getToken("accents.danger.dimBg")
          : getToken("accents.success.dim")
      }
      sx={{ borderRadius: "full", mb: "s" }}
    >
      <Icon
        size="2xl"
        sx={{ flexShrink: 0 }}
        color={
          status === "error"
            ? getToken("accents.danger.emphasis")
            : getToken("accents.success.emphasis")
        }
        component={status === "error" ? PixelX : PixelCheck}
      />
    </Flex>
  )
}
