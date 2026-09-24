import type { Finding } from "@/types"

/** The action cannot proceed while any finding blocks it. */
export const hasBlocker = <Code extends string>(
  findings: readonly Finding<Code>[],
): boolean => findings.some((finding) => finding.kind === "blocker")

/** The action may proceed only once the user accepts the risk reported. */
export const hasAcknowledgement = <Code extends string>(
  findings: readonly Finding<Code>[],
): boolean => findings.some((finding) => finding.kind === "acknowledgement")
