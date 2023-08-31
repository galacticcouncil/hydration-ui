import Skeleton from "react-loading-skeleton"
import { Heading } from "components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import { WhyBonds } from "./components/WhyBonds"

export const BondsPageSkeleton = () => {
  const { t } = useTranslation()

  return (
    <>
      <Heading fs={19} sx={{ mb: 33 }}>
        {t("bonds.title")}
      </Heading>
      <WhyBonds />
      <Skeleton width="100%" height={90} sx={{ mb: 12 }} />
      <Skeleton width="100%" height={90} sx={{ mb: 40 }} />
      <Skeleton width="100%" height={460} />
    </>
  )
}
