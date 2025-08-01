import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import React, { isValidElement } from "react"

import { ChevronDown } from "@/assets/icons"
import { Flex, Icon, Text } from "@/components"
import {
  SActionLabel,
  SActionLabelWhenOpen,
  SCollapsibleContent,
  SCollapsibleTrigger,
} from "@/components/Collapsible/Collapsible.styled"
import { getToken } from "@/utils"

const CollapsibleRoot = ({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) => {
  return <CollapsiblePrimitive.Root {...props} />
}

const CollapsibleTrigger = ({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) => {
  return <CollapsiblePrimitive.CollapsibleTrigger {...props} />
}

const CollapsibleContent = ({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) => {
  return <SCollapsibleContent {...props} />
}

type CollapsibleTriggerProps = {
  label: React.ReactNode
  actionLabel: string
  actionLabelWhenOpen?: string
}

type DefaultCollapsibleTriggerProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & CollapsibleTriggerProps

const DefaultCollapsibleTrigger: React.FC<DefaultCollapsibleTriggerProps> = ({
  label,
  actionLabel,
  actionLabelWhenOpen,
  ...props
}) => (
  <SCollapsibleTrigger {...props}>
    <Flex justify="space-between" align="center" py={8}>
      {isValidElement(label) ? (
        label
      ) : (
        <Text fs="p5" fw={500} color={getToken("text.medium")}>
          {label}
        </Text>
      )}
      <Flex gap={2} align="center">
        <Text fs="p5" fw={500} color={getToken("text.low")}>
          <SActionLabel>{actionLabel}</SActionLabel>
          <SActionLabelWhenOpen>
            {actionLabelWhenOpen ?? actionLabel}
          </SActionLabelWhenOpen>
        </Text>
        <Icon size={16} color={getToken("text.low")} component={ChevronDown} />
      </Flex>
    </Flex>
  </SCollapsibleTrigger>
)

export type CollapsibleRootProps = React.ComponentProps<
  typeof CollapsiblePrimitive.Root
>

type CollapsibleProps = CollapsibleRootProps &
  (
    | {
        trigger: React.ReactNode
        label?: never
        actionLabel?: never
        actionLabelWhenOpen?: never
      }
    | {
        trigger?: never
        label: React.ReactNode
        actionLabel: string
        actionLabelWhenOpen?: string
      }
  )
const Collapsible: React.FC<CollapsibleProps> = (props) => {
  const { children, ...rootProps } = props

  const trigger = (() => {
    if (isValidElement(props.trigger)) {
      return props.trigger
    }

    if (props.label && props.actionLabel) {
      return (
        <DefaultCollapsibleTrigger
          label={props.label}
          actionLabel={props.actionLabel}
          actionLabelWhenOpen={props.actionLabelWhenOpen}
        />
      )
    }

    return null
  })()

  return (
    <CollapsibleRoot {...rootProps}>
      {trigger && <CollapsibleTrigger asChild>{trigger}</CollapsibleTrigger>}
      <CollapsibleContent>{children}</CollapsibleContent>
    </CollapsibleRoot>
  )
}
export { Collapsible, CollapsibleContent, CollapsibleRoot, CollapsibleTrigger }
