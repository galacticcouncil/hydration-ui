import { LoadingPage } from "sections/loading/LoadingPage"
import { InvalidateOnBlock } from "components/InvalidateOnBlock"
import { ApiPromiseContext } from "utils/network"
import { FC, PropsWithChildren } from "react"
import { useProvider } from "api/provider"
import { ToastProvider } from "components/Toast/ToastProvider"
import { Transactions } from "sections/transaction/Transactions"

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  const api = useProvider()

  if (!api.data) return <LoadingPage />

  return (
    <ApiPromiseContext.Provider value={api.data}>
      <InvalidateOnBlock>
        <ToastProvider>
          {children}
          <Transactions />
        </ToastProvider>
      </InvalidateOnBlock>
    </ApiPromiseContext.Provider>
  )
}
