import { Heading } from "components/Typography/Heading/Heading"
import { Bond } from "components/Bond/Bond"
import { AssetLogo } from "components/AssetIcon/AssetIcon"

export const BondsPage = () => {
  return (
    <>
      <Heading>hydradx bonds</Heading>
      <Bond
        icon={<AssetLogo id="0" />}
        title="HDXb08112024"
        maturity="22.6.2024"
        endingIn="23H 22m"
        discount="5"
        onDetailClick={console.log}
      />
    </>
  )
}
