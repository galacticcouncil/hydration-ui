import { LoadingPage } from "sections/loading/LoadingPage"
import { InvalidateOnBlock } from "components/InvalidateOnBlock"
import { Transactions } from "sections/transaction/Transactions"
import { ApiPromiseContext } from "utils/network"
import { FC, PropsWithChildren } from "react"
import { useProvider } from "api/provider"

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  const api = useProvider()

  if (!api.data) return <LoadingPage />

  return (
    <ApiPromiseContext.Provider value={api.data}>
      <InvalidateOnBlock>
        {children}
        <Transactions />
      </InvalidateOnBlock>
    </ApiPromiseContext.Provider>
  )
}
