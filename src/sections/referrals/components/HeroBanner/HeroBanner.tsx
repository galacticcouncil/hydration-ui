import { FC } from "react"

import { useTranslation } from "react-i18next"
import { SContainer } from "./HeroBanner.styled"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"

type Props = {
  children: React.ReactNode
}

export const HeroBanner: FC<Props> = ({ children }) => {
  const { t } = useTranslation()
  return (
    <SContainer>
      <div sx={{ width: ["100%", "50%"], mb: 40 }}>
        <Heading fs={[28, 44]} font="ChakraPetch" sx={{ mb: 20 }}>
          {t("referrals.title")}
        </Heading>
        <Text fs={16} lh={24} color="brightBlue300" sx={{ pr: [0, 40] }}>
          {t("referrals.description")}
        </Text>
      </div>
      <div>{children}</div>
    </SContainer>
  )
}
