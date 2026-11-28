import { createContext, useContext } from "react"

// Step headers show a close button only inside the modal; the inline
// ModalContainer on the /deposit and /withdraw routes can't be closed.
export const OnrampClosableContext = createContext(false)

export const useOnrampClosable = () => useContext(OnrampClosableContext)
