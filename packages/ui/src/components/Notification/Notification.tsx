import { CloseNotification } from "@/assets/icons"
import {
  FailedNotification,
  SubmittedNotification,
  SuccessNotification,
  UnknownNotification,
  WarningNotification,
} from "@/assets/icons"

import { ButtonTransparent } from "../Button"
import { Icon } from "../Icon"
import { Text } from "../Text"
import {
  CustomToastProps,
  SNotification,
  SProgress,
  SProgressContainer,
  ToastVariant,
} from "./Notification.styled"

const DEFAULT_AUTO_CLOSE_TIME = 3

const getNotificationIcon = (variant: ToastVariant) => {
  if (variant === "success") return SuccessNotification
  if (variant === "error") return FailedNotification
  if (variant === "submitted") return SubmittedNotification
  if (variant === "warning") return WarningNotification

  return UnknownNotification
}

export const Notification = ({
  content,
  className,
  variant,
  autoClose = true,
  autoCloseTimeSC = DEFAULT_AUTO_CLOSE_TIME,
  onClose,
}: CustomToastProps) => {
  return (
    <SNotification className={className}>
      <div
        css={{
          display: "flex",
          gap: 8,
        }}
      >
        <Icon component={getNotificationIcon(variant)} size={16} />
        <Text font="Secondary" fw={400} fs={12}>
          {content}
        </Text>
        {/*Place for link button */}
      </div>

      {autoClose && (
        <SProgressContainer>
          <SProgress
            onAnimationEnd={onClose}
            closeTime={autoCloseTimeSC}
            variant={variant}
          />
        </SProgressContainer>
      )}
      {/*Add hover effects for button, missing in design */}
      <ButtonTransparent
        onClick={onClose}
        role="button"
        aria-label="Close Notification"
      >
        <Icon
          component={CloseNotification}
          size={18}
          css={{ position: "absolute", right: 5, top: 4 }}
        />
      </ButtonTransparent>
    </SNotification>
  )
}
