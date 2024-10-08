import { Content, Portal } from "@radix-ui/react-dropdown-menu"
import { SContent } from "components/Layout/Header/HeaderDropdown/HeaderDropdown.styled"
import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion"
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
    <LazyMotion features={domAnimation}>
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
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -6,
                  pointerEvents: "none",
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
              >
                {children}
              </SContent>
            </Content>
          </Portal>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}
