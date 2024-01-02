import { Navigate } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { Spacer } from "components/Spacer/Spacer"
import { CodeForm } from "./components/CodeForm/CodeForm"
import { ReferralsTableTableWrapper } from "./components/ReferralsTable/ReferralsTableWrapper"
import { FaqAccordion } from "./components/FaqAccordion/FaqAccordion"
import { HeroBanner } from "./components/HeroBanner/HeroBanner"
import { ReferrerCard } from "./components/ReferrerCard/ReferrerCard"
import { RewardsCard } from "./components/RewardsCard/RewardsCard"
import { TierStats } from "./components/TierStats/TierStats"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useReferralCodes } from "api/referrals"
import { getChainSpecificAddress } from "utils/formatting"

export const ReferralsWrapper = () => {
  const { isLoaded, featureFlags } = useRpcProvider()

  if (!isLoaded) return null

  if (!featureFlags.referrals) return <Navigate to="/trade" />

  return <ReferralsPage />
}

export const ReferralsPage = () => {
  const { account } = useAccount()

  const userReferralCode = useReferralCodes(
    account?.address ? getChainSpecificAddress(account.address) : undefined,
  )

  const myReferralCode = userReferralCode.data?.[0]?.referralCode

  return (
    <Page>
      <HeroBanner>
        <CodeForm />
      </HeroBanner>
      <Spacer size={30} />
      {account && (
        <>
          <div sx={{ flex: ["column", "row"], gap: 20, flexWrap: "wrap" }}>
            <RewardsCard />
            <ReferrerCard />
          </div>
          {myReferralCode && (
            <>
              <Spacer size={30} />
              <TierStats />
              <Spacer size={30} />
              <ReferralsTableTableWrapper />
            </>
          )}
        </>
      )}
      <Spacer size={30} />
      <FaqAccordion />
    </Page>
  )
}
