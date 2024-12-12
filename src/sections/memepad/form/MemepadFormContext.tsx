import { FileUploaderProvider } from "components/FileUploader"
import { createContext, PropsWithChildren, useContext } from "react"
import { useMemepad } from "./MemepadForm.utils"

type FormContext = ReturnType<typeof useMemepad>

const MemepadFormContext = createContext<FormContext>({} as FormContext)

export const useMemepadFormContext = () => {
  return useContext(MemepadFormContext)
}

export const MemepadFormContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const value = useMemepad()
  return (
    <MemepadFormContext.Provider value={value}>
      {children}
    </MemepadFormContext.Provider>
  )
}

export const MemepadFormProvider: React.FC<PropsWithChildren> = ({
  children,
}) => (
  <FileUploaderProvider autoUpload={false} multiple={false}>
    <MemepadFormContextProvider>{children}</MemepadFormContextProvider>
  </FileUploaderProvider>
)
