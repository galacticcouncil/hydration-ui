import {
  Portal,
  Root,
  TooltipContentProps,
  Trigger,
} from "@radix-ui/react-tooltip"
import { FC, ReactNode, useState } from "react"

import { CircleInfo } from "@/assets/icons"
import {
  BoxProps,
  ButtonIcon,
  DrawerHeader,
  Icon,
  Modal,
  ModalBody,
  Text,
} from "@/components"
import { useBreakpoints } from "@/theme"
import { getToken } from "@/utils"

import { SContent, STrigger } from "./Tooltip.styled"

export type InfoTooltipProps = {
  text: ReactNode | string
  children?: ReactNode
  side?: TooltipContentProps["side"]
  align?: TooltipContentProps["align"]
  sideOffset?: TooltipContentProps["sideOffset"]
  alignOffset?: TooltipContentProps["alignOffset"]
  asChild?: boolean
  preventDefault?: boolean
  iconColor?: BoxProps["color"]
}

export const Tooltip = ({
  text,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 3,
  alignOffset = -10,
  asChild = false,
  preventDefault,
  iconColor,
}: InfoTooltipProps) => {
  const [open, setOpen] = useState(false)
  const { isMobile } = useBreakpoints()

  if (isMobile) {
    return (
      <>
        <ButtonIcon
          asChild={asChild}
          onClick={(e) => {
            if (preventDefault) {
              e.preventDefault()
              e.stopPropagation()
            }

            setOpen(true)
          }}
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          sx={{ p: 0, height: "auto", width: "auto" }}
        >
          {children || <TooltipIcon color={iconColor} />}
        </ButtonIcon>

        <Modal open={open} onOpenChange={setOpen}>
          <DrawerHeader
            customTitle=" "
            title="Tooltip"
            sx={{ borderBottom: "none" }}
          />
          <ModalBody>{text}</ModalBody>
        </Modal>
      </>
    )
  }

  const TriggerComp = asChild ? Trigger : STrigger

  return (
    <Root delayDuration={0} open={open} onOpenChange={setOpen}>
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
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {children || <TooltipIcon color={iconColor} />}
      </TriggerComp>
      <Portal>
        <SContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={12}
        >
          {typeof text === "string" ? (
            <Text fw={500} fs={12}>
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
    sx={{ cursor: "pointer" }}
    component={CircleInfo}
    size={14}
    color={getToken("icons.onContainer")}
    {...props}
  />
)
