import { isAsset } from "@/core/assets"
import { Decimal } from "@/core/big"
import type {
  AccountSummary,
  SummarizeAccountRequest,
} from "@/core/derive-account"
import { summarizeAccount } from "@/core/derive-account"
import { eModeCategories } from "@/core/derive-emode"
import { healthFactorFindings } from "@/core/finding-rules"
import { projectAccount } from "@/core/project-account"
import type { Finding } from "@/types"

export type AssessEModeRequest = SummarizeAccountRequest & {
  /** The category to switch to; 0 leaves e-mode. */
  categoryId: number
}

export type EModeAssessment = {
  /** The account in the target category. */
  projection: AccountSummary
  findings: Finding[]
}

/**
 * What entering, switching or leaving e-mode would do. Blockers mirror
 * `ValidationLogic.validateSetUserEMode`; the health factor is checked
 * whenever the account leaves a category, as `Pool.setUserEMode` does
 * (ADR-0011).
 */
export function assessEMode({
  categoryId,
  ...request
}: AssessEModeRequest): EModeAssessment {
  const current = summarizeAccount(request)
  const currentCategoryId = request.positions.eModeCategoryId

  const blockers: Finding[] = []
  if (categoryId === currentCategoryId) {
    blockers.push({ kind: "blocker", code: "sameEModeCategory", params: {} })
  }
  if (categoryId !== 0) {
    const outsideCategory = request.positions.positions.some((position) => {
      if (Decimal(position.scaledVariableDebt).eq(0)) return false
      const summary = request.summaries.find((candidate) =>
        isAsset(candidate.underlyingAsset, position.underlyingAsset),
      )
      return summary?.eModeCategoryId !== categoryId
    })
    if (outsideCategory) {
      const category = eModeCategories(request.summaries).find(
        (candidate) => candidate.id === categoryId,
      )
      blockers.push({
        kind: "blocker",
        code: "borrowsOutsideCategory",
        params: { category: category?.label ?? "" },
      })
    }
  }

  const projection = projectAccount({
    ...request,
    change: { kind: "setEMode", categoryId },
  })

  const notices: Finding[] = []
  if (currentCategoryId === 0 && categoryId !== 0 && blockers.length === 0) {
    notices.push({
      kind: "notice",
      tone: "warning",
      code: "eModeRestrictsBorrowing",
      params: {},
    })
  }

  return {
    projection,
    findings: [
      ...blockers,
      // Entering from none only ever raises the health factor.
      ...(currentCategoryId === 0
        ? []
        : healthFactorFindings({
            current: current.account.healthFactor,
            projected: projection.account.healthFactor,
            hasDebt: Decimal(
              projection.account.totalBorrowsMarketReferenceCurrency,
            ).gt(0),
          })),
      ...notices,
    ],
  }
}
