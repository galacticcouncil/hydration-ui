import {
  SMaskContainer,
  SActiveReferendumIcon,
  SPendingBridgeIcon,
  SImportantToastsIcon,
} from "./Bell.styled"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { useToast } from "state/toasts"
import { useTranslation } from "react-i18next"
import { useOpenGovReferendas } from "api/democracy"
import { m as motion } from "framer-motion"
import {
  SToolbarButton,
  SToolbarIcon,
} from "components/Layout/Header/toolbar/HeaderToolbar.styled"
import BellIcon from "assets/icons/BellIcon.svg?react"
import { Spinner } from "components/Spinner/Spinner"
import { useWormholeTransfersQuery } from "api/wormhole"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useWormholeRedeemStore } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.utils"

const IMPORTANT_TOASTS_LIMIT = 9

export const Bell = () => {
  const { setSidebar, toasts } = useToast()
  const { t } = useTranslation()

  const { account } = useAccount()
  const { data: transfers } = useWormholeTransfersQuery(
    account?.address ?? "",
    "redeemable",
  )

  const pendingRedeemIds = useWormholeRedeemStore(
    (state) => state.pendingRedeemIds,
  )
  const redeemableTransfers = transfers?.filter(
    (transfer) => !pendingRedeemIds.includes(transfer.operation.id),
  )

  const { isLoading: isOpenGovLoading, data: openGovReferendas } =
    useOpenGovReferendas()

  const loadingToasts = toasts.filter(
    (toast) => toast.variant === "progress" && !toast.bridge,
  )
  const bridgeToasts = toasts.filter(
    (toast) => toast.bridge && toast.variant === "progress",
  )
  const isLoading = !!loadingToasts.length || isOpenGovLoading

  const hasReferendum = !!openGovReferendas?.length
  const hasBridgeToasts = !!bridgeToasts.length
  const hasRedeemableTransfers = !!redeemableTransfers?.length

  const tooltipText = `
    ${
      isLoading
        ? t("header.notification.pending.tooltip", {
            number: loadingToasts.length,
          })
        : t("header.notification.tooltip")
    }${hasReferendum ? `, ${t("header.notification.activeReferendum")}` : ""}
  `

  const iconType = (() => {
    if (hasRedeemableTransfers) return "important"
    if (hasBridgeToasts) return "bridge"
    if (hasReferendum) return "referendum"
    return "none"
  })()

  const importantToastCount = transfers?.length ?? 0

  return (
    <InfoTooltip
      text={tooltipText}
      type={isLoading ? "default" : "black"}
      asChild
    >
      <SToolbarButton onClick={() => setSidebar(true)}>
        {isLoading && <Spinner size={42} css={{ position: "absolute" }} />}
        <SMaskContainer cropped={iconType !== "none"}>
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
        {iconType === "important" && (
          <SImportantToastsIcon>
            {Math.min(IMPORTANT_TOASTS_LIMIT, importantToastCount)}
            {importantToastCount > IMPORTANT_TOASTS_LIMIT && "+"}
          </SImportantToastsIcon>
        )}
        {iconType === "bridge" && <SPendingBridgeIcon />}
        {iconType === "referendum" && <SActiveReferendumIcon />}
      </SToolbarButton>
    </InfoTooltip>
  )
}
