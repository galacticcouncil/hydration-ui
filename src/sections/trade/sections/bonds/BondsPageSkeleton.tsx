import Skeleton from "react-loading-skeleton"
import { Heading } from "components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"

export const BondsPageSkeleton = () => {
  const { t } = useTranslation()

  return (
    <>
      <Heading fs={19} sx={{ mb: 33 }}>
        {t("bonds.title")}
      </Heading>
      <Skeleton width="100%" height={350} sx={{ mb: 40 }} />
      <Skeleton width="100%" height={90} sx={{ mb: 12 }} />
      <Skeleton width="100%" height={90} sx={{ mb: 40 }} />
      <Skeleton width="100%" height={460} />
    </>
  )
}
