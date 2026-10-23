import { Paper } from "@galacticcouncil/ui/components"
import { createContext, FC, ReactNode, useContext } from "react"
import { createPortal } from "react-dom"

export const OnrampModalFooterContext = createContext<HTMLElement | null>(null)

export const OnrampModalFooter: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const container = useContext(OnrampModalFooterContext)
  if (!container) return null

  return createPortal(
    <Paper data-onramp-modal-footer p={["l", "xl"]} width="100%">
      {children}
    </Paper>,
    container,
  )
}
