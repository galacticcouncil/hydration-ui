import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import {
  useTotalOffers,
  useUserTotalOffers,
} from "sections/otc/header/OtcHeaderTotal.utils"
import BN from "bignumber.js"

type Props = { myOffers: boolean }

export const OtcHeaderTotal = ({ myOffers }: Props) => {
  if (myOffers) {
    return <OtcHeaderTotalUser />
  }
  return <OtcHeaderTotalChain />
}

const OtcHeaderTotalData = ({
  value,
  isLoading,
}: {
  value: BN | undefined
  isLoading: boolean
}) => {
  const { t } = useTranslation()

  return (
    <Heading
      as="h3"
      sx={{
        fontSize: [16, 42],
        fontWeight: 500,
      }}
    >
      {!isLoading ? (
        <>
          <Text
            font="ChakraPetch"
            fw={900}
            fs={[19, 42]}
            sx={{ display: "inline-block" }}
          >
            $
          </Text>
          {t("value", {
            value,
            type: "dollar",
          })}
        </>
      ) : (
        <Skeleton width={256} />
      )}
    </Heading>
  )
}

const OtcHeaderTotalChain = () => {
  const { data, isLoading } = useTotalOffers()
  return <OtcHeaderTotalData value={data} isLoading={isLoading} />
}

const OtcHeaderTotalUser = () => {
  const { data, isLoading } = useUserTotalOffers()
  return <OtcHeaderTotalData value={data} isLoading={isLoading} />
}
