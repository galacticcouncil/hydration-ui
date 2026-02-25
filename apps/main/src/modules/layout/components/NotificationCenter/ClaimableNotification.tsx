import { Notification } from "@galacticcouncil/ui/components"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useRelativeDate } from "@/hooks/useRelativeDate"
import { ClaimButton } from "@/modules/xcm/history/components/ClaimButton"
import { getTransferAsset } from "@/modules/xcm/history/utils/assets"
import { resolveChainFromUrn } from "@/modules/xcm/history/utils/claim"
import { toDecimal } from "@/utils/formatting"

type ClaimableNotificationProps = {
  journey: XcJourney
}

export const ClaimableNotification: FC<ClaimableNotificationProps> = ({
  journey,
}) => {
  const { t } = useTranslation("common")
  const dateString = useRelativeDate(
    new Date(journey.sentAt ?? journey.createdAt),
  )

  const asset = getTransferAsset(journey.assets)
  const chain = resolveChainFromUrn(journey.destination)

  return (
    <Notification
      fullWidth
      autoClose={false}
      variant="info"
      content={t("claim.toast.idle", {
        value: asset ? toDecimal(asset.amount, asset.decimals) : "",
        symbol: asset?.symbol ?? "",
        chainName: chain?.name ?? "",
      })}
      dateString={dateString}
      actions={<ClaimButton journey={journey} />}
    />
  )
}
