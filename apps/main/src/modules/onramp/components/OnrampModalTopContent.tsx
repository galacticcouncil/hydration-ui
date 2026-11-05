import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useLayoutEffect,
} from "react"
import { createPortal } from "react-dom"

export const OnrampModalTopContentContext = createContext<{
  container: HTMLElement | null
  setVisible: Dispatch<SetStateAction<boolean>>
} | null>(null)

type OnrampModalTopContentProps = { children: ReactNode }

export const OnrampModalTopContent: FC<OnrampModalTopContentProps> = ({
  children,
}) => {
  const context = useContext(OnrampModalTopContentContext)
  const setVisible = context?.setVisible

  useLayoutEffect(() => {
    if (!setVisible) return
    setVisible(true)
    return () => setVisible(false)
  }, [setVisible])

  return context?.container ? createPortal(children, context.container) : null
}
