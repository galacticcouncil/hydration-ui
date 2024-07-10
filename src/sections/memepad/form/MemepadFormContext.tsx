import { createContext, useContext } from "react"
import { useMemepadForms } from "./MemepadForm.utils"

export type MemepadFormContextProps = {
  children?: React.ReactNode
}

type FormContext = ReturnType<typeof useMemepadForms>

const MemepadFormContext = createContext<FormContext>({} as FormContext)

export const useMemepadFormContext = () => {
  return useContext(MemepadFormContext)
}

export const MemepadFormProvider: React.FC<MemepadFormContextProps> = ({
  children,
}) => {
  const value = useMemepadForms()
  return (
    <MemepadFormContext.Provider value={value}>
      {children}
    </MemepadFormContext.Provider>
  )
}
