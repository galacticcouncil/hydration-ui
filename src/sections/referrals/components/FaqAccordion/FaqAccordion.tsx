import Cake from "assets/icons/Cake.svg?react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import Percentage from "assets/icons/Percentage.svg?react"
import Treasury from "assets/icons/Treasury.svg?react"
import { Accordion } from "components/Accordion/Accordion"
import { FeatureBox } from "components/FeatureBox/FeatureBox"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { theme } from "theme"

const FAQ_STEPS = [
  {
    icon: (
      <Percentage height={20} width={20} sx={{ color: "vibrantBlue200" }} />
    ),
    id: "step1",
  },
  {
    icon: <Treasury height={20} width={20} sx={{ color: "brightBlue300" }} />,
    id: "step2",
  },
  {
    icon: <Cake height={20} width={20} sx={{ color: "green700" }} />,
    id: "step3",
  },
] as const

export const FaqAccordion = () => {
  const { t } = useTranslation()
  return (
    <Accordion open title={t(`referrals.faq.title`)} columns={3}>
      {FAQ_STEPS.map(({ id, icon }) => (
        <FeatureBox
          key={id}
          label={icon}
          title={t(`referrals.faq.${id}.title`)}
          description={t(`referrals.faq.${id}.description`)}
        />
      ))}
      <div>
        <Text
          color="brightBlue600"
          fs={12}
          css={{
            borderBottom: `1px solid ${theme.colors.brightBlue600}`,
            display: "inline-block",
            "&:hover": {
              color: theme.colors.brightBlue100,
            },
          }}
        >
          <a href="https://docs.hydradx.io/referrals" target="_blank" rel="noreferrer">
            {t("referrals.faq.docs.learnMore")}
            <LinkIcon height={10} sx={{ ml: 6 }} />
          </a>
        </Text>
      </div>
    </Accordion>
  )
}
