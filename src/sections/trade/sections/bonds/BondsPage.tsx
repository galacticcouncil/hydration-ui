import { Heading } from "components/Typography/Heading/Heading"
import { WhyBonds } from "./components/WhyBonds"
import { useTranslation } from "react-i18next"
import { MyActiveBonds } from "./MyActiveBonds"
import { BondList } from "./list/BondList"
import { Spacer } from "components/Spacer/Spacer"
import { useRpcProvider } from "providers/rpcProvider"

export const BondsPage = () => {
  const { t } = useTranslation()
  const {
    assets: { bonds },
  } = useRpcProvider()

  return (
    <>
      <Heading fs={19}>{t("bonds.title")}</Heading>
      <Spacer axis="vertical" size={33} />
      <BondList bonds={bonds} />
      <Spacer axis="vertical" size={33} />
      <WhyBonds />
      <Spacer axis="vertical" size={40} />
      <MyActiveBonds showTransactions />
    </>
  )
}
