import { Heading } from "components/Typography/Heading/Heading"
import { useBonds } from "api/bonds"
import { WhyBonds } from "./components/WhyBonds"
import { useTranslation } from "react-i18next"
import { MyActiveBonds } from "./MyActiveBonds"
import { BondList } from "./list/BondList"
import { Spacer } from "components/Spacer/Spacer"

export const BondsPage = () => {
  const { t } = useTranslation()
  const bonds = useBonds()

  return (
    <>
      <Heading fs={19}>{t("bonds.title")}</Heading>
      <Spacer axis="vertical" size={33} />
      <BondList isLoading={bonds.isLoading} bonds={bonds.data ?? []} />
      <Spacer axis="vertical" size={33} />
      <WhyBonds />
      <Spacer axis="vertical" size={40} />
      <MyActiveBonds />
    </>
  )
}
