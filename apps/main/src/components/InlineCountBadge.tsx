import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ComponentProps, FC } from "react"

type InlineCountBadgeProps = Pick<
  ComponentProps<typeof Text>,
  "children" | "aria-hidden"
>

export const InlineCountBadge: FC<InlineCountBadgeProps> = ({
  children,
  ...props
}) => (
  <Text
    as="span"
    fs="p6"
    fw={600}
    px="s"
    borderRadius="full"
    bg={getToken("buttons.secondary.accent.rest")}
    flexShrink={0}
    data-count-badge
    {...props}
  >
    {children}
  </Text>
)
