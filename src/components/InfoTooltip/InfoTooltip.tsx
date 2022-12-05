import * as Tooltip from "@radix-ui/react-tooltip"
import { Text } from "components/Typography/Text/Text"
import { ReactNode, useState } from "react"
import { STrigger } from "./InfoTooltip.styled"

export function InfoTooltip(props: { text: ReactNode; children: ReactNode }) {
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
        {props.children}
      </STrigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sx={{ bg: "black", p: 16 }}
          css={{
            borderRadius: 6,
            maxWidth: "calc(100vw - 12px * 2)",
            zIndex: 10,
          }}
          side="bottom"
          align="start"
          sideOffset={3}
          alignOffset={-10}
          collisionPadding={12}
        >
          <Text sx={{ fontSize: 12, fontWeight: 400 }}>{props.text}</Text>
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
