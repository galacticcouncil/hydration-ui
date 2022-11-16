import { FC, PropsWithChildren } from "react"
import { useTranslation } from "react-i18next"
import {
  SClose,
  SCounter,
  SProgressBar,
  SRoot,
} from "components/Toast/Toast.styled"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { TOAST_CLOSE_TIME } from "utils/constants"
import { Maybe } from "utils/helpers"
import { ToastContent } from "./ToastContent"

type Props = {
  variant: Maybe<"info" | "success" | "error" | "loading">
  text?: string
  index?: number
  count?: number
  onClose?: () => void
  persist?: boolean
}

export const Toast: FC<PropsWithChildren<Props>> = ({
  variant = "info",
  text,
  index,
  count,
  onClose,
  children,
  persist,
}) => {
  const { t } = useTranslation()

  return (
    <SRoot
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <ToastContent variant={variant ?? "info"} content={{ text, children }}>
        <SCounter>
          <Text fs={12} lh={14} fw={500} color="neutralGray400">
            {!!index &&
              !!count &&
              count > 1 &&
              t("toast.counter", { index, count })}
          </Text>
          <SProgressBar
            variant={variant}
            initial={{ width: "100%" }}
            animate={!persist && { width: "0%" }}
            transition={{ duration: TOAST_CLOSE_TIME / 1000, ease: "linear" }}
            onAnimationComplete={onClose}
          />
        </SCounter>
      </ToastContent>
      <SClose aria-label={t("toast.close")} onClick={onClose}>
        <CrossIcon />
      </SClose>
    </SRoot>
  )
}
