import { eModeCategories } from "@galacticcouncil/money-market/core"
import {
  useAccountSummary,
  useReserveSummaries,
} from "@galacticcouncil/money-market/react"
import { Select } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { evmAccountBindingQuery } from "@/api/evm"
import { ActionModal } from "@/modules/money-market/actions/ActionModal"
import { EModeForm } from "@/modules/money-market/actions/EModeForm"
import { useUserAddress } from "@/modules/money-market/hooks"
import { useRpcProvider } from "@/providers/rpcProvider"

export const EModeSelect: FC = () => {
  const { t } = useTranslation("borrow")
  const user = useUserAddress()
  const { data: current } = useAccountSummary(user)
  const { data: reserves } = useReserveSummaries()
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const { account } = useAccount()
  const { data: isBound } = useQuery(
    evmAccountBindingQuery(useRpcProvider(), account?.address ?? ""),
  )

  if (!user || !current || !reserves || !isBound) return null

  const currentId = current.account.eModeCategoryId

  return (
    <>
      <Select
        label={t("emode.title")}
        variant={currentId ? "accent" : undefined}
        items={[
          { key: "0", label: t("emode.disabled") },
          ...eModeCategories(reserves).map((category) => ({
            key: String(category.id),
            label: category.label,
          })),
        ]}
        value={String(currentId)}
        onValueChange={(value) => {
          if (Number(value) !== currentId) setCategoryId(Number(value))
        }}
      />
      <ActionModal
        open={categoryId !== null}
        onClose={() => setCategoryId(null)}
        title={t("emode.title")}
      >
        {categoryId !== null && (
          <EModeForm
            key={categoryId}
            initialCategoryId={categoryId}
            onSubmitted={() => setCategoryId(null)}
          />
        )}
      </ActionModal>
    </>
  )
}
