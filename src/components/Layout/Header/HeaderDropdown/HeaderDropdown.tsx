import { Content, Portal } from "@radix-ui/react-dropdown-menu"
import { SContent } from "components/Layout/Header/HeaderDropdown/HeaderDropdown.styled"
import { AnimatePresence } from "framer-motion"
import { ReactNode } from "react"

export type HeaderDropdownProps = {
  open?: boolean
  children?: ReactNode
  className?: string
}

export const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  open = false,
  children,
  className,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <Portal forceMount>
          <Content
            align="end"
            sideOffset={18}
            css={{ zIndex: 5 }}
            className={className}
          >
            <SContent
              initial={{ opacity: 0, height: 50, x: 200 }}
              animate={{ opacity: 1, height: "auto", x: 0 }}
              exit={{ opacity: 0, height: 50, x: 200, pointerEvents: "none" }}
              transition={{
                type: "spring",
                mass: 1,
                stiffness: 300,
                damping: 20,
                duration: 0.2,
              }}
            >
              {children}
            </SContent>
          </Content>
        </Portal>
      )}
    </AnimatePresence>
  )
}
