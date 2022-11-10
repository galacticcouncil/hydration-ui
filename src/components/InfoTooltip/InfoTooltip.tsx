import * as Tooltip from "@radix-ui/react-tooltip"
import { ReactComponent as InfoIcon } from "assets/icons/InfoIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { ReactNode, useState } from "react"
import { STrigger } from "./InfoTooltip.styled"

export function InfoTooltip(props: { text: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Tooltip.Root
      delayDuration={0}
      open={open}
      onOpenChange={(data) => setOpen(data)}
    >
      <STrigger
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <InfoIcon />
      </STrigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sx={{ bg: "darkBlue400", p: "11px 16px" }}
          css={{ maxWidth: "calc(100vw - 12px * 2)" }}
          side="bottom"
          align="start"
          sideOffset={3}
          alignOffset={-10}
          collisionPadding={12}
        >
          <Text fs={11} fw={500}>
            {props.text}
          </Text>
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
