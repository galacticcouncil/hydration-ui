import { FC, ReactNode } from "react"
import { FormProvider } from "react-hook-form"
import { useNewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"

type Props = {
  readonly defaultAssetId: string
  readonly children: ReactNode
}

export const NewDepositFormWrapper: FC<Props> = ({
  children,
  defaultAssetId,
}) => {
  const form = useNewDepositForm({ defaultAssetId })

  return <FormProvider {...form}>{children}</FormProvider>
}
