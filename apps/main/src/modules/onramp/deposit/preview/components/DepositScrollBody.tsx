import { Box, ModalBody, ScrollArea } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, ReactNode } from "react"

type DepositScrollBodyProps = {
  children: ReactNode
  noPadding?: boolean
  contained?: boolean
}

export const DepositScrollBody: FC<DepositScrollBodyProps> = ({
  children,
  noPadding,
  contained = false,
}) => {
  const { gte } = useBreakpoints()
  if (gte("sm"))
    return contained ? (
      <ModalBody
        noPadding={noPadding}
        scrollable={false}
        sx={{
          minHeight: 0,
          overflowY: "auto",
          maxHeight: "calc(75vh - var(--modal-block-offset))",
        }}
      >
        {children}
      </ModalBody>
    ) : (
      <ModalBody noPadding={noPadding}>{children}</ModalBody>
    )
  return (
    <ModalBody
      noPadding
      scrollable={false}
      display="flex"
      sx={{ minHeight: 0 }}
    >
      <ScrollArea height="100%">
        <Box p={noPadding ? 0 : "xl"}>{children}</Box>
      </ScrollArea>
    </ModalBody>
  )
}
