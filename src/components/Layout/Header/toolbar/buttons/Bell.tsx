import { SMaskContainer, SActiveReferendumIcon } from "./Bell.styled"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { useToast } from "state/toasts"
import { useTranslation } from "react-i18next"
import { useReferendums } from "api/democracy"
import { motion } from "framer-motion"
import {
  SToolbarButton,
  SToolbarIcon,
} from "components/Layout/Header/toolbar/HeaderToolbar.styled"
import BellIcon from "assets/icons/BellIcon.svg?react"
import { Spinner } from "components/Spinner/Spinner"

export const Bell = () => {
  const { setSidebar, toasts } = useToast()
  const { t } = useTranslation()

  const referendumsQuery = useReferendums("ongoing")
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
    <InfoTooltip
      text={tooltipText}
      type={isLoading ? "default" : "black"}
      asChild
    >
      <SToolbarButton onClick={() => setSidebar(true)}>
        {isLoading && <Spinner size={50} css={{ position: "absolute" }} />}
        <SMaskContainer cropped={hasReferendum}>
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
        {hasReferendum && <SActiveReferendumIcon />}
      </SToolbarButton>
    </InfoTooltip>
  )
}
