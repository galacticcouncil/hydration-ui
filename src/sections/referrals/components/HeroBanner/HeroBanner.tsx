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
      <div sx={{ maxWidth: [400, 600] }}>
        <Heading
          fs={[20, 40]}
          font="GeistMono"
          sx={{ mb: 20 }}
          fw={400}
          css={{ textWrap: "balance" }}
        >
          {t("referrals.title")}
        </Heading>
        <Text
          fs={[14, 16]}
          lh={[20, 24]}
          color="brightBlue300"
          sx={{ pr: [0, 40] }}
        >
          {t("referrals.description")}
        </Text>
      </div>
      <div>{children}</div>
    </SContainer>
  )
}
