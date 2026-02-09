import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react"
import { FC, ReactNode } from "react"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"

export type PaginationNavButtonProps = {
  direction: "prev" | "next"
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
}

export const PaginationNavButton: FC<PaginationNavButtonProps> = ({
  direction,
  disabled = false,
  onClick,
  children,
}) => {
  const IconComponent: LucideIcon =
    direction === "prev" ? ChevronLeft : ChevronRight

  return (
    <Button
      size="small"
      variant="tertiary"
      outline
      disabled={disabled}
      onClick={onClick}
      sx={{ px: "l" }}
    >
      <Icon size="s" component={IconComponent} display={["block", "none"]} />
      <Text as="span" display={["none", "inline"]}>
        {children}
      </Text>
    </Button>
  )
}
