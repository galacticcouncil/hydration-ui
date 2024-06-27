import { Text } from "components/Typography/Text/Text"
import { SContainer } from "sections/staking/StakingPage.styled"
import { SGuideItemCount } from "./StakingGuide.styled"
import { Link } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { Trans, useTranslation } from "react-i18next"
import { LazyMotion, domAnimation, m as motion } from "framer-motion"

type StakingGuideItemProps = {
  title: string
  desc: JSX.Element
  freq: number
}

const GUIDE_CONFIG = [
  {
    title: "staking.dashboard.guide.first.title",
    desc: "staking.dashboard.guide.first.desc",
    withLink: true,
  },
  {
    title: "staking.dashboard.guide.second.title",
    desc: "staking.dashboard.guide.second.desc",
    withLink: false,
  },
  {
    title: "staking.dashboard.guide.third.title",
    desc: "staking.dashboard.guide.third.desc",
    withLink: false,
  },
  {
    title: "staking.dashboard.guide.fourth.title",
    desc: "staking.dashboard.guide.fourth.desc",
    withLink: false,
  },
] as const

const StakingGuideItem = ({ title, desc, freq }: StakingGuideItemProps) => {
  return (
    <li
      css={{
        display: "grid",
        gridTemplateColumns: "min-content auto",
        columnGap: 18,
      }}
    >
      <SGuideItemCount>
        <Text fs={[10, 12]} color="white">
          {freq}
        </Text>
      </SGuideItemCount>
      <div sx={{ flex: "column", gap: 4 }}>
        <Text color="white" fs={[16, 18]} font="GeistSemiBold">
          {title}
        </Text>
        {desc}
      </div>
    </li>
  )
}

export const StakingGuide = () => {
  const { t } = useTranslation()

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "auto" }}
        exit={{ height: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        css={{ overflow: "hidden" }}
      >
        <SContainer
          sx={{
            p: "36px 46px",
            minWidth: ["100%"],
            display: ["none", "inherit"],
          }}
        >
          <Text color="brightBlue300" fs={19} font="GeistMono">
            {t("staking.dashboard.guide.title")}
          </Text>
          <ul sx={{ pl: 0, flex: "column", gap: 28 }}>
            {GUIDE_CONFIG.map((item, index) => {
              const desc = (
                <div sx={{ display: "inline" }}>
                  <Text color="darkBlue200" fs={[14, 15]}>
                    <Trans t={t} i18nKey={item.desc}>
                      {item.withLink && (
                        <Link
                          to={LINKS.trade}
                          sx={{ color: "brightBlue100" }}
                          css={{
                            textDecoration: "underline",
                            "&:hover": {
                              opacity: 0.7,
                            },
                          }}
                        />
                      )}
                    </Trans>
                  </Text>
                </div>
              )
              return (
                <StakingGuideItem
                  key={`${index}_guide_item`}
                  freq={index + 1}
                  title={t(item.title)}
                  desc={desc}
                />
              )
            })}
          </ul>
        </SContainer>
      </motion.div>
    </LazyMotion>
  )
}
