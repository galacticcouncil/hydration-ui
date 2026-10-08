import {
  Portal,
  Root,
  TooltipContentProps,
  Trigger,
} from "@radix-ui/react-tooltip"
import { FC, ReactNode, useState } from "react"

import { CircleInfo } from "@/assets/icons"
import { BoxProps } from "@/components/Box"
import { ButtonTransparent } from "@/components/Button"
import { Drawer, DrawerBody } from "@/components/Drawer"
import { Flex } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useBreakpoints } from "@/theme"
import { getToken } from "@/utils"

import {
  SContent,
  STrigger,
  TooltipSize,
  tooltipTextFontSize,
} from "./Tooltip.styled"

export type { TooltipSize }

export type InfoTooltipProps = {
  text: ReactNode | string
  children?: ReactNode
  size?: TooltipSize
  side?: TooltipContentProps["side"]
  align?: TooltipContentProps["align"]
  sideOffset?: TooltipContentProps["sideOffset"]
  alignOffset?: TooltipContentProps["alignOffset"]
  asChild?: boolean
  preventDefault?: boolean
  iconColor?: BoxProps["color"]
  /** The surface, border and shadow of a `Paper`, for rich content. */
  paper?: boolean
}

export const Tooltip = ({
  text,
  children,
  size = "medium",
  side = "top",
  align = "center",
  sideOffset = 3,
  alignOffset = -10,
  asChild = false,
  preventDefault,
  iconColor,
  paper,
}: InfoTooltipProps) => {
  const [open, setOpen] = useState(false)
  const { isMobile } = useBreakpoints()

  if (!text) {
    return children
  }

  if (isMobile && size !== "small") {
    const openDrawer = (e: React.MouseEvent | React.PointerEvent) => {
      if (preventDefault) {
        e.preventDefault()
        e.stopPropagation()
      }

      setOpen(true)
    }

    const drawer = (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        customTitle=" "
        title="Tooltip"
      >
        <DrawerBody>{text}</DrawerBody>
      </Drawer>
    )

    if (asChild) {
      return (
        <>
          <Flex
            align="center"
            gap="xs"
            asChild
            onClick={openDrawer}
            onPointerDown={openDrawer}
          >
            {children || <TooltipIcon color={iconColor} />}
          </Flex>
          {drawer}
        </>
      )
    }

    return (
      <>
        <ButtonTransparent
          onClick={openDrawer}
          onPointerDown={openDrawer}
          sx={{ justifyContent: "start", color: iconColor }}
        >
          {children || <TooltipIcon color={iconColor} />}
        </ButtonTransparent>
        {drawer}
      </>
    )
  }

  const TriggerComp = asChild ? Trigger : STrigger

  return (
    <Root
      delayDuration={size === "small" ? 700 : 0}
      open={open}
      onOpenChange={setOpen}
    >
      <TriggerComp
        type="button"
        asChild={asChild}
        onClick={(e) => {
          if (preventDefault) {
            e.preventDefault()
            e.stopPropagation()
          }

          setOpen(true)
        }}
        onPointerDown={
          asChild
            ? undefined
            : (e) => {
                e.preventDefault()
                e.stopPropagation()
              }
        }
      >
        {children || <TooltipIcon color={iconColor} />}
      </TriggerComp>
      <Portal>
        <SContent
          size={size}
          paper={paper}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={12}
        >
          {typeof text === "string" ? (
            <Text fw={500} fs={tooltipTextFontSize[size]}>
              {text}
            </Text>
          ) : (
            text
          )}
        </SContent>
      </Portal>
    </Root>
  )
}

export const TooltipIcon: FC<BoxProps> = (props) => (
  <Icon
    sx={{
      cursor: "pointer",
      display: "flex",
      color: getToken("icons.onContainer"),
    }}
    component={CircleInfo}
    size="0.875em"
    {...props}
  />
)
