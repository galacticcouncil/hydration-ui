import ErrorStatus from "@galacticcouncil/ui/assets/images/ErrorStatus.webp"
import SuccessStatus from "@galacticcouncil/ui/assets/images/SuccessStatus.webp"
import { Image, Spinner } from "@galacticcouncil/ui/components"
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
    <Image
      src={status === "error" ? ErrorStatus : SuccessStatus}
      width={100}
      height={100}
    />
  )
}
