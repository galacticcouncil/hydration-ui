import {
  CircleAlert,
  CircleCheck,
  CircleClose,
  MoveUpRight,
  QuestionCircleRegular,
  Send,
  SquareQuestion,
  TriangleAlert,
} from "@/assets/icons"
import {
  ButtonIcon,
  ButtonTransparent,
  ExternalLink,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@/components"
import { getToken } from "@/utils"

import {
  SCloseIcon,
  SIconVariant,
  SNotification,
  SProgress,
  SProgressContainer,
} from "./Notification.styled"

export const DEFAULT_AUTO_CLOSE_TIME = 3000

export type ToastVariant =
  | "pending"
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
  dateString?: string
  link?: string
  hint?: string
}

const notificationIcons: Record<ToastVariant, React.ComponentType> = {
  pending: Spinner,
  success: CircleCheck,
  error: CircleAlert,
  submitted: Send,
  warning: TriangleAlert,
  unknown: SquareQuestion,
}

export const Notification = ({
  content,
  className,
  variant,
  autoClose = true,
  autoCloseTimeSC = DEFAULT_AUTO_CLOSE_TIME,
  onClose,
  dateString,
  link,
  hint,
}: CustomToastProps) => {
  return (
    <SNotification className={className}>
      <Flex gap={8}>
        <SIconVariant
          component={notificationIcons[variant]}
          variant={variant}
          size={16}
        />
        <Stack gap={2}>
          <Text fw={500} fs="p5">
            {content}
          </Text>
          {dateString && (
            <Text fs="p6" fw={500} color={getToken("text.medium")}>
              {dateString}
            </Text>
          )}
        </Stack>
        <Flex ml="auto">
          {hint && (
            <Tooltip text={hint} asChild>
              <ButtonIcon>
                <Icon component={QuestionCircleRegular} size={18} />
              </ButtonIcon>
            </Tooltip>
          )}
          {link && (
            <ButtonIcon asChild>
              <ExternalLink href={link}>
                <Icon component={MoveUpRight} size={18} />
              </ExternalLink>
            </ButtonIcon>
          )}
        </Flex>
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
