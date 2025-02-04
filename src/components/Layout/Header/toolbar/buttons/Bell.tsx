import {
  SMaskContainer,
  SActiveReferendumIcon,
  SPendingBridgeIcon,
} from "./Bell.styled"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { useToast } from "state/toasts"
import { useTranslation } from "react-i18next"
import { useOpenGovReferendas, useReferendums } from "api/democracy"
import { m as motion } from "framer-motion"
import {
  SToolbarButton,
  SToolbarIcon,
} from "components/Layout/Header/toolbar/HeaderToolbar.styled"
import BellIcon from "assets/icons/BellIcon.svg?react"
import { Spinner } from "components/Spinner/Spinner"

export const Bell = () => {
  const { setSidebar, toasts } = useToast()
  const { t } = useTranslation()

  const { data: referendums } = useReferendums("ongoing")
  const { isLoading: isOpenGovLoading, data: openGovReferendas } =
    useOpenGovReferendas()

  const loadingToasts = toasts.filter(
    (toast) => toast.variant === "progress" && !toast.bridge,
  )
  const bridgeToasts = toasts.filter(
    (toast) => toast.bridge && toast.variant === "progress",
  )
  const isLoading = !!loadingToasts.length || isOpenGovLoading

  const hasReferendum = !!referendums?.length || !!openGovReferendas?.length
  const hasBridgeToasts = !!bridgeToasts.length

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
    <InfoTooltip
      text={tooltipText}
      type={isLoading ? "default" : "black"}
      asChild
    >
      <SToolbarButton onClick={() => setSidebar(true)}>
        {isLoading && <Spinner size={42} css={{ position: "absolute" }} />}
        <SMaskContainer cropped={hasReferendum || hasBridgeToasts}>
          <motion.div
            sx={{ flex: "row", align: "center" }}
            whileTap={{ rotate: 30 }}
            transition={{
              type: "spring",
              mass: 1,
              stiffness: 1067,
              damping: 20,
              duration: 0.3,
            }}
          >
            <SToolbarIcon as={BellIcon} aria-label={t("toast.sidebar.title")} />
          </motion.div>
        </SMaskContainer>
        {hasBridgeToasts ? (
          <SPendingBridgeIcon />
        ) : hasReferendum ? (
          <SActiveReferendumIcon />
        ) : null}
      </SToolbarButton>
    </InfoTooltip>
  )
}
