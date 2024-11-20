import {
  CircleAlert,
  CircleCheck,
  CircleClose,
  Send,
  SquareQuestion,
  TriangleAlert,
} from "@/assets/icons"

import { ButtonTransparent } from "../Button"
import { Text } from "../Text"
import {
  CustomToastProps,
  SCloseIcon,
  SIconVariant,
  SNotification,
  SProgress,
  SProgressContainer,
  ToastVariant,
} from "./Notification.styled"

const DEFAULT_AUTO_CLOSE_TIME = 3

const getNotificationIcon = (variant: ToastVariant) => {
  if (variant === "success") return CircleCheck
  if (variant === "error") return CircleAlert
  if (variant === "submitted") return Send
  if (variant === "warning") return TriangleAlert

  return SquareQuestion
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
        <SIconVariant
          component={getNotificationIcon(variant)}
          variant={variant}
          size={16}
        />
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
        <SCloseIcon component={CircleClose} size={18} />
      </ButtonTransparent>
    </SNotification>
  )
}
