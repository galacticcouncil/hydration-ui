import { FC, PropsWithChildren } from "react"
import { useTranslation } from "react-i18next"
import {
  SClose,
  SContainer,
  SContent,
  SCounter,
  Shadow,
  SIcon,
  SProgressBar,
  SProgressBarBg,
  SRoot,
} from "components/Toast/Toast.styled"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { ReactComponent as SuccessIcon } from "assets/icons/SuccessIcon.svg"
import { ReactComponent as FailIcon } from "assets/icons/FailIcon.svg"
import { ReactComponent as InfoIcon } from "assets/icons/InfoIcon.svg"
import { ReactComponent as BasiliskIcon } from "assets/icons/BasiliskIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { TOAST_CLOSE_TIME } from "utils/constants"
import { ToastSpinner } from "components/Spinner/Spinner.styled"

export type ToastVariant = "info" | "success" | "error" | "loading"

type Props = {
  variant?: ToastVariant
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
      <SContainer variant={variant}>
        <SIcon>
          {variant === "success" ? (
            <SuccessIcon />
          ) : variant === "error" ? (
            <FailIcon />
          ) : variant === "loading" ? (
            <ToastSpinner width={28} height={28} />
          ) : variant === "info" ? (
            <InfoIcon />
          ) : (
            <BasiliskIcon />
          )}
        </SIcon>
        <SContent>
          {text ? (
            <Text fs={12} lh={16} fw={500} color="basic100">
              {text}
            </Text>
          ) : (
            children
          )}
        </SContent>
        <SCounter>
          <Text fs={12} lh={14} fw={500} color="basic400">
            {!!index &&
              !!count &&
              count > 1 &&
              t("toast.counter", { index, count })}
          </Text>
        </SCounter>
        <SProgressBarBg />
        <SProgressBar
          variant={variant}
          initial={{ width: "100%" }}
          animate={!persist && { width: "0%" }}
          transition={{ duration: TOAST_CLOSE_TIME / 1000, ease: "linear" }}
          onAnimationComplete={onClose}
        />
      </SContainer>
      <SClose
        aria-label={t("toast.close")}
        onClick={() => {
          onClose?.()
        }}
      >
        <CrossIcon />
      </SClose>
      <Shadow variant={variant} />
    </SRoot>
  )
}
