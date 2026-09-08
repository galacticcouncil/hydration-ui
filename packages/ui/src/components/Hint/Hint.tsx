import {
  Anchor,
  PopoverContentProps as RadixPopoverContentProps,
  Portal,
  Root,
} from "@radix-ui/react-popover"
import { X } from "lucide-react"
import { ReactNode } from "react"

import { Flex, Icon, Text } from "@/components"

import {
  SAdvanceButton,
  SArrow,
  SCenteredArrow,
  SContent,
  SIconButton,
} from "./Hint.styled"

export type HintProps = {
  open: boolean
  title?: ReactNode
  description: ReactNode
  actionLabel: string
  onDismiss: () => void
  onAdvance: () => void
  side?: RadixPopoverContentProps["side"]
  align?: RadixPopoverContentProps["align"]
  /** Zero-based index of the live step. */
  step?: number
  stepCount?: number
  asChild?: boolean
  children: ReactNode
}

export const Hint = ({
  open,
  title,
  description,
  actionLabel,
  onDismiss,
  onAdvance,
  side = "bottom",
  align = "center",
  step = 0,
  stepCount = 1,
  asChild = false,
  children,
}: HintProps) => {
  const isMultiStep = stepCount > 1

  return (
    <Root open={open} modal={false}>
      <Anchor asChild={asChild}>{children}</Anchor>
      <Portal>
        <SContent
          role="status"
          side={side}
          align={align}
          sideOffset={2}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Flex direction="column" gap="s">
            {(title || isMultiStep) && (
              <Flex
                align="center"
                justify={title ? "space-between" : "flex-end"}
                gap="m"
              >
                {typeof title === "string" ? (
                  <Text fw={500} fs="p4">
                    {title}
                  </Text>
                ) : (
                  title
                )}
                {isMultiStep && (
                  <SIconButton
                    type="button"
                    aria-label="Dismiss"
                    onClick={onDismiss}
                  >
                    <Icon size="s" component={X} />
                  </SIconButton>
                )}
              </Flex>
            )}
            {typeof description === "string" ? (
              <Text fw={400} fs="p6">
                {description}
              </Text>
            ) : (
              description
            )}
            <Flex
              align="center"
              justify={isMultiStep ? "space-between" : "flex-end"}
              gap="m"
            >
              {isMultiStep && (
                <Text fw={500} fs="p6" whiteSpace="nowrap">
                  {step + 1} / {stepCount}
                </Text>
              )}
              <SAdvanceButton onClick={onAdvance}>{actionLabel}</SAdvanceButton>
            </Flex>
          </Flex>
          <SArrow data-hint-arrow width="1rem" height="0.5rem" />
          <SCenteredArrow
            data-hint-centered-arrow
            aria-hidden
            width="1rem"
            height="0.5rem"
            viewBox="0 0 30 10"
            preserveAspectRatio="none"
          >
            <polygon points="0,0 30,0 15,10" />
          </SCenteredArrow>
        </SContent>
      </Portal>
    </Root>
  )
}
