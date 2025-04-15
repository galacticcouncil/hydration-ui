import { FC, ReactNode } from "react"
import { FormProvider } from "react-hook-form"
import { useNewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"

type Props = {
  readonly children: ReactNode
}

export const NewDepositFormWrapper: FC<Props> = ({ children }) => {
  const form = useNewDepositForm()

  return <FormProvider {...form}>{children}</FormProvider>
}
