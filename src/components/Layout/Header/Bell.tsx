import { Spinner } from "../../Spinner/Spinner.styled"
import {
  MaskContainer,
  SActiveReferendumIcon,
  SBellIcon,
  SWrap,
} from "./Bell.styled"
import { InfoTooltip } from "../../InfoTooltip/InfoTooltip"
import { useToast } from "state/toasts"
import { useTranslation } from "react-i18next"
import { useReferendums } from "api/democracy"

export const Bell = () => {
  const { setSidebar, toasts } = useToast()
  const { t } = useTranslation()

  const referendumsQuery = useReferendums()
  const loadingToasts = toasts.filter((toast) => toast.variant === "progress")
  const isLoading = !!loadingToasts.length || referendumsQuery.isLoading

  const hasReferendum = !!referendumsQuery.data?.length

  const tooltipText = `
    ${
      isLoading
        ? t("header.notification.pending.tooltip", {
            number: loadingToasts.length,
          })
        : t("header.notification.tooltip")
    }${hasReferendum ? `, ${t("header.notification.activeReferendum")}` : ""}
  `

  return (
    <InfoTooltip text={tooltipText} type={isLoading ? "default" : "black"}>
      <div
        css={{ position: "relative" }}
        sx={{ flex: "row", justify: "center", align: "center" }}
      >
        {isLoading && (
          <Spinner width={40} height={40} css={{ position: "absolute" }} />
        )}
        <SWrap onClick={() => setSidebar(true)}>
          <MaskContainer cropped={hasReferendum}>
            <SBellIcon aria-label={t("toast.sidebar.title")} />
          </MaskContainer>
          {hasReferendum && <SActiveReferendumIcon />}
        </SWrap>
      </div>
    </InfoTooltip>
  )
}
