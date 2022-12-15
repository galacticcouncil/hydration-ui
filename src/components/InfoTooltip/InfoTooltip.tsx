import * as Tooltip from "@radix-ui/react-tooltip"
import { Text } from "components/Typography/Text/Text"
import { ReactNode, useState } from "react"
import { theme } from "theme"
import { STrigger } from "./InfoTooltip.styled"

type InfoTooltipProps = {
  text: ReactNode
  textOnClick?: ReactNode
  children: ReactNode
}

export function InfoTooltip({ text, textOnClick, children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(text)
  return (
    <Tooltip.Root
      delayDuration={0}
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        // reset state of the content
        textOnClick && !isOpen && setContent(text)
      }}
    >
      <STrigger
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // change the content on the click if the text is provided
          textOnClick && setContent(textOnClick)
          setOpen(true)
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {children}
      </STrigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sx={{ bg: "darkBlue400", p: "11px 16px" }}
          css={{ maxWidth: "calc(100vw - 12px * 2)", zIndex: 10 }}
          side="bottom"
          align="start"
          sideOffset={3}
          alignOffset={-10}
          collisionPadding={12}
        >
          <Text fs={11} fw={500}>
            {content}
          </Text>
          <Tooltip.Arrow
            css={{ "& > polygon": { fill: theme.colors.darkBlue400 } }}
          />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
