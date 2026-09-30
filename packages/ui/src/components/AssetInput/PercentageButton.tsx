import { isMobileDevice } from "@galacticcouncil/utils"
import * as Popover from "@radix-ui/react-popover"
import { Percent } from "lucide-react"
import { useRef, useState } from "react"

import { Button, MicroButton } from "@/components/Button"
import { Drawer, DrawerBody } from "@/components/Drawer"
import { Flex } from "@/components/Flex"
import { Grid } from "@/components/Grid"
import { Icon } from "@/components/Icon"
import { Paper } from "@/components/Paper"
import { SContent as SPopoverContent } from "@/components/Popover"
import { useUiScale } from "@/theme"

const PERCENTAGES = [25, 50, 75]
const CLOSE_DELAY = 100

export type PercentageButtonProps = {
  onSelect: (percent: number) => void
}

export const PercentageButton = ({ onSelect }: PercentageButtonProps) => {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // keyboard opens move focus into the menu; hover opens must not steal it
  const isKeyboardOpen = useRef(false)

  const select = (percent: number) => {
    onSelect(percent)
    setOpen(false)
  }

  const uiScale = useUiScale()

  const icon = <Icon component={Percent} size="xs" />

  if (isMobileDevice()) {
    return (
      <>
        <MicroButton aria-label="percentage" onClick={() => setOpen(true)}>
          {icon}
        </MicroButton>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          title="Amount"
          customTitle=" "
        >
          <DrawerBody>
            <Grid columns={PERCENTAGES.length} gap="base">
              {PERCENTAGES.map((percent) => (
                <Button
                  key={percent}
                  variant="tertiary"
                  outline
                  size="large"
                  onClick={() => select(percent)}
                >
                  {percent}%
                </Button>
              ))}
            </Grid>
          </DrawerBody>
        </Drawer>
      </>
    )
  }

  const hoverProps = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return
      clearTimeout(closeTimer.current)
      isKeyboardOpen.current = false
      setOpen(true)
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return
      closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY)
    },
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        asChild
        {...hoverProps}
        onClick={(e) => {
          e.preventDefault()
          isKeyboardOpen.current = e.detail === 0
          setOpen(true)
        }}
      >
        <MicroButton aria-label="percentage">{icon}</MicroButton>
      </Popover.Trigger>
      <Popover.Portal>
        <SPopoverContent
          side="top"
          align="end"
          sideOffset={uiScale * 4}
          alignOffset={uiScale * -12}
          collisionPadding={4}
          {...hoverProps}
          onOpenAutoFocus={(e) => {
            if (!isKeyboardOpen.current) e.preventDefault()
          }}
          onCloseAutoFocus={(e) => {
            if (!isKeyboardOpen.current) e.preventDefault()
          }}
        >
          <Paper p="base">
            <Flex gap="s">
              {PERCENTAGES.map((percent) => (
                <MicroButton key={percent} onClick={() => select(percent)}>
                  {percent}%
                </MicroButton>
              ))}
            </Flex>
          </Paper>
        </SPopoverContent>
      </Popover.Portal>
    </Popover.Root>
  )
}
