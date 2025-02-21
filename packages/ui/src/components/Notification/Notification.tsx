import {
  CircleAlert,
  CircleCheck,
  CircleClose,
  Send,
  SquareQuestion,
  TriangleAlert,
} from "@/assets/icons"
import { ButtonTransparent, Flex, Text } from "@/components"

import {
  SCloseIcon,
  SIconVariant,
  SNotification,
  SProgress,
  SProgressContainer,
} from "./Notification.styled"

export const DEFAULT_AUTO_CLOSE_TIME = 3000

export type ToastVariant =
  | "submitted"
  | "success"
  | "error"
  | "unknown"
  | "warning"

type CustomToastProps = {
  variant: ToastVariant
  content: string
  className?: string
  onClose?: () => void
  autoClose?: boolean
  autoCloseTimeSC?: number
}

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
      <Flex gap={8}>
        <SIconVariant
          component={getNotificationIcon(variant)}
          variant={variant}
          size={16}
        />
        <Text fw={400} fs={12}>
          {content}
        </Text>
        {/*Place for link button */}
      </Flex>

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
      {onClose && (
        <ButtonTransparent
          onClick={onClose}
          role="button"
          aria-label="Close Notification"
        >
          <SCloseIcon component={CircleClose} size={18} />
        </ButtonTransparent>
      )}
    </SNotification>
  )
}
