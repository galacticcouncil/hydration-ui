import { Chip, Skeleton } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import type { MultisigHistoryStatus } from "@/api/multisig"

type Props = {
  status: MultisigHistoryStatus
  approvalCount?: number
  threshold?: number
  isLoading?: boolean
}

export const MultisigHistoryStatusChip: React.FC<Props> = ({
  status,
  approvalCount,
  threshold,
  isLoading = false,
}) => {
  const { t } = useTranslation()

  if (isLoading) {
    return <Skeleton sx={{ width: "3xl" }} />
  }

  if (status === "rejected") {
    return (
      <Chip variant="red" size="small">
        {t("multisig.detail.history.status.rejected")}
      </Chip>
    )
  }

  if (status === "proposed") {
    return (
      <Chip variant="info" size="small">
        {t("multisig.detail.history.status.proposed")}
      </Chip>
    )
  }

  if (status === "approved") {
    return (
      <Chip variant="info" size="small">
        {approvalCount && threshold
          ? t("multisig.detail.history.status.approvedProgress", {
              approved: approvalCount,
              threshold,
            })
          : t("multisig.detail.history.status.approved")}
      </Chip>
    )
  }

  return (
    <Chip variant="green" size="small">
      {t("multisig.detail.history.status.executed")}
    </Chip>
  )
}
