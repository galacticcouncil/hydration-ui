import * as Tooltip from "@radix-ui/react-tooltip"
import { Text } from "components/Typography/Text/Text"
import { ReactNode, useState } from "react"
import { theme } from "theme"
import { SContent, STrigger } from "./InfoTooltip.styled"

type InfoTooltipProps = {
  text: ReactNode
  textOnClick?: ReactNode
  children: ReactNode
  type?: "default" | "black"
}

export function InfoTooltip({
  text,
  textOnClick,
  children,
  type = "default",
}: InfoTooltipProps) {
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
          textOnClick && e.preventDefault()
          textOnClick && e.stopPropagation()
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
        <SContent
          type={type}
          side="bottom"
          align="start"
          sideOffset={3}
          alignOffset={-10}
          collisionPadding={12}
        >
          <Text fs={11} fw={500}>
            {content}
          </Text>
          {type === "default" && (
            <Tooltip.Arrow
              css={{
                "& > polygon": { fill: theme.colors.darkBlue400 },
              }}
            />
          )}
        </SContent>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
