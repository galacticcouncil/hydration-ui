import { isSS58Address, safeConvertAddressSS58 } from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod/v4"

export type SignerValidationMessages = {
  invalid: string
  duplicate: string
  thresholdExceedsSigners: string
}

function collectSignerValueIssues(
  signers: { value: string }[],
  messages: SignerValidationMessages,
): { index: number; message: string }[] {
  const issues: { index: number; message: string }[] = []

  signers.forEach((s, i) => {
    const v = s.value
    if (!v.trim()) return
    if (!isSS58Address(v)) {
      issues.push({ index: i, message: messages.invalid })
    }
  })

  const normToIndices = new Map<string, number[]>()
  signers.forEach((s, i) => {
    const v = s.value
    if (!v.trim() || !isSS58Address(v)) return
    const norm = safeConvertAddressSS58(v)
    let arr = normToIndices.get(norm)
    if (!arr) {
      arr = []
      normToIndices.set(norm, arr)
    }
    arr.push(i)
  })

  for (const indices of normToIndices.values()) {
    if (indices.length > 1) {
      for (const i of indices) {
        issues.push({ index: i, message: messages.duplicate })
      }
    }
  }

  return issues
}

export function getSignerValueErrorAtIndex(
  signers: { value: string }[],
  index: number,
  messages: SignerValidationMessages,
): string | undefined {
  return collectSignerValueIssues(signers, messages).find(
    (issue) => issue.index === index,
  )?.message
}

export function createMultisigSetupSchema(messages: SignerValidationMessages) {
  return z
    .object({
      name: z.string().trim().min(1, "Name is required").max(32),
      signers: z.array(z.object({ value: z.string() })).min(1),
      threshold: z.number().min(1),
    })
    .superRefine((data, ctx) => {
      const { signers, threshold } = data

      for (const issue of collectSignerValueIssues(signers, messages)) {
        ctx.addIssue({
          code: "custom",
          path: ["signers", issue.index, "value"],
          message: issue.message,
        })
      }

      const validCount = signers.filter(
        (s) => s.value && isSS58Address(s.value),
      ).length
      if (threshold > validCount) {
        ctx.addIssue({
          code: "custom",
          path: ["threshold"],
          message: messages.thresholdExceedsSigners,
        })
      }
    })
}

export type MultisigSetupFormValues = z.infer<
  ReturnType<typeof createMultisigSetupSchema>
>

const MIN_SIGNERS = 2

type UseMultisigSetupFormOptions = {
  defaultSignerAddress?: string
}

export const useMultisigSetupForm = (options?: UseMultisigSetupFormOptions) => {
  const { t } = useTranslation()
  const firstSigner = options?.defaultSignerAddress ?? ""

  const schema = useMemo(
    () =>
      createMultisigSetupSchema({
        invalid: t("multisig.setup.error.invalid"),
        duplicate: t("multisig.setup.error.duplicate"),
        thresholdExceedsSigners: t(
          "multisig.setup.error.thresholdExceedsSigners",
        ),
      }),
    [t],
  )

  const defaultValues: MultisigSetupFormValues = {
    name: "",
    signers: firstSigner
      ? [{ value: firstSigner }, { value: "" }]
      : [{ value: "" }],
    threshold: MIN_SIGNERS,
  }

  return useForm<MultisigSetupFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
  })
}
