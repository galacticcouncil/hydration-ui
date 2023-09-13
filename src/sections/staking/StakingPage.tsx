import { Navigate } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { Spacer } from "components/Spacer/Spacer"
import { Heading } from "components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import { StakingDashboard } from "./sections/dashboard/StakingDashboard"
import { useProviderRpcUrlStore } from "api/provider"
import { useApiPromise } from "utils/api"
import { useBestNumber } from "api/chain"
import { isApiLoaded } from "utils/helpers"
import { enableStakingBlock } from "utils/constants"

const pageEnabled = import.meta.env.VITE_FF_STAKING_ENABLED === "true"

export const StakingPage = () => {
  const { t } = useTranslation()
  const providers = useProviderRpcUrlStore()
  const api = useApiPromise()
  const bestNumber = useBestNumber(!isApiLoaded(api))

  const isMainnet =
    (providers.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL) ===
      "wss://rpc.hydradx.cloud" || import.meta.env.VITE_ENV === "production"

  const blockNumber = bestNumber.data?.parachainBlockNumber.toNumber()

  if (!blockNumber) return null

  if (isMainnet && blockNumber < enableStakingBlock)
    return <Navigate to="/trade" />

  if (!pageEnabled) return <Navigate to="/trade" />

  return (
    <Page>
      <Heading as="h1" fs={19} lh={19} fw={500}>
        {t("staking.title")}
      </Heading>
      <Spacer size={35} />
      <StakingDashboard />
    </Page>
  )
}
