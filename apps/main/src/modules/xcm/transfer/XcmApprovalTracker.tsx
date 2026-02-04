import { useFormContext } from "react-hook-form"

import { useTrackApprovals } from "@/modules/xcm/transfer/hooks/useTrackApprovals"

export const XcmApprovalTracker = () => {
  const { watch } = useFormContext()
  const srcChain = watch("srcChain")

  useTrackApprovals(srcChain?.key ?? "")

  return null
}
