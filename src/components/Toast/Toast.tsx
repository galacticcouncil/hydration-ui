import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
  SClose,
  SProgressBar,
  SProgressContainer,
  SRoot,
} from "components/Toast/Toast.styled"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { TOAST_CLOSE_TIME } from "utils/constants"
import { Maybe } from "utils/helpers"
import { ToastContent } from "./ToastContent"
import { Button } from "components/Button/Button"

type Props = {
  variant: Maybe<"info" | "success" | "error" | "loading">
  title?: string | ReactNode
  actions?: ReactNode
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
    <SRoot
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      forceMount
    >
      <ToastContent
        variant={variant ?? "info"}
        title={title}
        actions={actions}
        dateCreated={dateCreated}
        meta={
          <div sx={{ flex: "row", gap: 8 }}>
            <Text fs={12} lh={14} fw={500} color="neutralGray400">
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
    </SRoot>
  )
}
