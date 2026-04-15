import { Bell as BellIcon } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  Icon,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetRoot,
  SheetTrigger,
  Spinner,
  Stack,
} from "@galacticcouncil/ui/components"
import { safeConvertPublicKeyToSS58 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState/EmptyState"
import { ClaimableNotification } from "@/modules/layout/components/NotificationCenter/ClaimableNotification"
import { MultisigNotification } from "@/modules/layout/components/NotificationCenter/MultisigNotification"
import { NotificationBadge } from "@/modules/layout/components/NotificationCenter/NotificationBadge"
import { NotificationGroup } from "@/modules/layout/components/NotificationCenter/NotificationGroup"
import { NotificationToast } from "@/modules/layout/components/NotificationCenter/NotificationToast"
import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import { useXcScan } from "@/modules/xcm/history/useXcScan"
import { useMultisigContext } from "@/providers/MultisigProvider"
import { useToasts } from "@/states/toasts"

export const NotificationCenter: FC = () => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const { totalPendingTxCount, multisigs, pendingTxsByMultisig } =
    useMultisigContext()
  const { toasts } = useToasts()
  const { data: claimable } = useXcScan(account?.address ?? "", {
    claimableOnly: true,
  })
  const { pendingCorrelationIds } = usePendingClaimsStore()
  const visibleClaimable = claimable.filter(
    ({ correlationId }) => !pendingCorrelationIds.includes(correlationId),
  )

  const groups = Object.groupBy(toasts, (toast) =>
    toast.variant === "pending" ? "pending" : "completed",
  )

  const pending = groups.pending ?? []
  const completed = groups.completed ?? []

  const totalclaimableCount = visibleClaimable.length
  const totalImportantCount = totalclaimableCount + totalPendingTxCount

  return (
    <SheetRoot>
      <SheetTrigger asChild>
        <ButtonIcon>
          <Icon component={BellIcon} size="l" />
          {pending.length > 0 && (
            <Spinner
              sx={{
                position: "absolute",
                inset: 0,
                size: "100%",
                strokeWidth: 1,
              }}
            />
          )}
          <NotificationBadge count={totalImportantCount} />
        </ButtonIcon>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader title={t("notifications")} />
        <SheetBody sx={{ pt: 10 }}>
          <Stack gap="xl">
            {totalImportantCount > 0 && (
              <NotificationGroup label={t("important")} defaultOpen>
                {multisigs.map((multisig) => {
                  const address = safeConvertPublicKeyToSS58(multisig.pubKey)
                  const pendingTxs = pendingTxsByMultisig.get(address) ?? []

                  return pendingTxs.map((tx) => (
                    <MultisigNotification
                      key={tx.callHash}
                      tx={tx}
                      multisig={multisig}
                    />
                  ))
                })}
                {visibleClaimable.map((journey) => (
                  <ClaimableNotification
                    key={journey.correlationId}
                    journey={journey}
                  />
                ))}
              </NotificationGroup>
            )}

            {pending.length > 0 && (
              <NotificationGroup label={t("pending")} defaultOpen>
                {pending.map((props) => (
                  <NotificationToast key={props.id} {...props} />
                ))}
              </NotificationGroup>
            )}

            {completed.length > 0 && (
              <NotificationGroup label={t("completed")} defaultOpen>
                {completed.map((props) => (
                  <NotificationToast key={props.id} {...props} />
                ))}
              </NotificationGroup>
            )}

            {toasts.length === 0 &&
              visibleClaimable.length === 0 &&
              totalPendingTxCount === 0 && (
                <EmptyState
                  header={t("notifications.empty.title")}
                  description={t("notifications.empty.description")}
                />
              )}
          </Stack>
        </SheetBody>
      </SheetContent>
    </SheetRoot>
  )
}
