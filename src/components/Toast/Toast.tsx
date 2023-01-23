import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
  SClose,
  Shadow,
  SProgressBar,
  SProgressContainer,
  SRoot,
} from "components/Toast/Toast.styled"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { TOAST_CLOSE_TIME } from "utils/constants"
import { ToastContent } from "./ToastContent"
import { motion } from "framer-motion"
import { ToastVariant } from "state/toasts"

type Props = {
  variant?: ToastVariant
  title?: string | ReactNode
  link?: string
  actions?: ReactNode
  index?: number
  count?: number
  onClose?: () => void
  persist?: boolean
  dateCreated?: Date
  onClick?: () => void
}

export const Toast: FC<Props> = ({
  variant = "info",
  title,
  link,
  actions,
  index,
  count,
  dateCreated,
  onClose,
  onClick,
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
        css={{ backdropFilter: "blur(15px)" }}
      >
        <ToastContent
          variant={variant ?? "info"}
          title={title}
          link={link}
          actions={actions}
          onClick={onClick}
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
      <Shadow variant={variant} />
    </SRoot>
  )
}
