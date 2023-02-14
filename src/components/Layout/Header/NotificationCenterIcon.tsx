import {
  RESET_TOAST_TIMING,
  useToastStorage,
} from "components/AppProviders/ToastContext"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Spinner } from "components/Spinner/Spinner.styled"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { SBellIcon } from "./Header.styled"

export const NotificationCenterIcon = () => {
  const { t } = useTranslation()
  const { toasts, unknown, setSidebar } = useToastStorage()

  const loadingToasts = toasts.filter((toast) => toast.variant === "progress")
  const isLoadingToast = !!loadingToasts.length

  useEffect(() => {
    if (isLoadingToast) {
      setTimeout(() => {
        unknown(loadingToasts[0].id)
      }, RESET_TOAST_TIMING)
    }
  }, [isLoadingToast, loadingToasts, unknown])

  return (
    <InfoTooltip
      text={
        isLoadingToast
          ? t("header.notification.pending.tooltip", {
              number: loadingToasts.length,
            })
          : t("header.notification.tooltip")
      }
      type={isLoadingToast ? "default" : "black"}
    >
      <div css={{ position: "relative" }}>
        {isLoadingToast && <Spinner width={40} height={40} />}
        <SBellIcon
          onClick={() => setSidebar(true)}
          aria-label={t("toast.sidebar.title")}
          css={
            isLoadingToast && {
              position: "absolute",
            }
          }
        />
      </div>
    </InfoTooltip>
  )
}
