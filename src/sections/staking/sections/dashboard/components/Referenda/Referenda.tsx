import { useReferendums } from "api/democracy"
import { ReferendumCard } from "components/ReferendumCard/ReferendumCard"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer } from "sections/staking/StakingPage.styled"

export const Rerefenrenda = () => {
  const { t } = useTranslation()
  const referendums = useReferendums()

  if (!referendums.data) return null

  return (
    <SContainer sx={{ p: [24, "21px 16px 16px"], gap: 21 }}>
      <Text font="FontOver" fs={19} tTransform="uppercase">
        {t("stats.overview.referenda.title")}
      </Text>
      <ReferendumCard type="staking" {...referendums.data[0]} />
    </SContainer>
  )
}
