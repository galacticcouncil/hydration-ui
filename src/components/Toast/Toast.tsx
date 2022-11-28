import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
  SClose,
  SContainer,
  SContent,
  SCounter,
  Shadow,
  SIcon,
  SProgressBar,
  SProgressContainer,
  SRoot,
} from "components/Toast/Toast.styled"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { ReactComponent as SuccessIcon } from "assets/icons/SuccessIcon.svg"
import { ReactComponent as FailIcon } from "assets/icons/FailIcon.svg"
import { ReactComponent as InfoIcon } from "assets/icons/InfoIcon.svg"
import { ReactComponent as BasiliskIcon } from "assets/icons/BasiliskIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { TOAST_CLOSE_TIME } from "utils/constants"
import { ToastContent } from "./ToastContent"
import { motion } from "framer-motion"

export type ToastVariant = "info" | "success" | "error" | "loading"

type Props = {
  variant?: ToastVariant
  title?: string | ReactNode
  actions?: ReactNode
  text?: string
  index?: number
  count?: number
  onClose?: () => void
  persist?: boolean
  dateCreated?: Date
}

export const Toast: FC<Props> = ({
  variant = "info",
  title,
  actions,
  index,
  count,
  dateCreated,
  onClose,
  persist,
}) => {
  const { t } = useTranslation()

  return (
    <SRoot forceMount>
      <motion.div
        layout
        initial={{ x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ToastContent
          variant={variant ?? "info"}
          title={title}
          actions={actions}
          dateCreated={dateCreated}
          meta={
            <div sx={{ flex: "row", gap: 8 }}>
              <Text fs={12} lh={14} fw={500} color="basic400">
                {!!index &&
                  !!count &&
                  count > 1 &&
                  t("toast.counter", { index, count })}
              </Text>
            </div>
          }
        >
          <SProgressContainer>
            <SProgressBar
              variant={variant}
              initial={{ width: "0%" }}
              animate={!persist && { width: "100%" }}
              transition={{ duration: TOAST_CLOSE_TIME / 1000 }}
              onAnimationComplete={onClose}
            />
          </SProgressContainer>
        </ToastContent>
        <SClose aria-label={t("toast.close")} onClick={onClose}>
          <CrossIcon />
        </SClose>
      </motion.div>
    </SRoot>
  )
}
