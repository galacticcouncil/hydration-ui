import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { Step } from "./Step"
import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"
import { Icon } from "components/Icon/Icon"
import { whyBonds } from "sections/trade/sections/bonds/Bonds.utils"
import { useTranslation } from "react-i18next"
import { SBondSteps, SWhyBonds } from "./WhyBonds.styled"
import { ReactComponent as WhyBondsIcon } from "assets/icons/WhyBonds.svg"
import { ReactComponent as ChevronDownIcon } from "assets/icons/ChevronDown.svg"
import { ButtonTransparent } from "components/Button/Button"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

export const WhyBonds = () => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  return (
    <SWhyBonds
      expanded={expanded}
      onClick={() => setExpanded((state) => !state)}
    >
      <div sx={{ flex: "row", justify: "space-between", height: 24 }}>
        <div sx={{ flex: "row", gap: 8, align: "center" }}>
          <Icon icon={<WhyBondsIcon />} />
          <Text
            color="white"
            fs={19}
            fw={600}
            font="FontOver"
            tTransform="uppercase"
          >
            {t("bonds.whyBonds.title")}
          </Text>
        </div>

        <div sx={{ flex: "row", align: "center" }}>
          <Text fs={13} color="darkBlue300">
            {t(expanded ? "hide" : "show")}
          </Text>
          <ButtonTransparent
            css={{
              color: theme.colors.iconGray,
              transform: expanded ? "rotate(180deg)" : undefined,
              transition: theme.transitions.default,
            }}
          >
            <Icon icon={<ChevronDownIcon />} sx={{ color: "darkBlue300" }} />
          </ButtonTransparent>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            css={{ overflow: "hidden" }}
          >
            <SBondSteps>
              {whyBonds.map((whyBond) => (
                <Step
                  key={whyBond.index}
                  icon={<Icon icon={whyBond.icon} />}
                  title={t(`bonds.whyBonds.${whyBond.index}.title`)}
                  description={t(`bonds.whyBonds.${whyBond.index}.desc`)}
                />
              ))}
            </SBondSteps>
            <Text
              color="brightBlue600"
              fs={12}
              sx={{ mt: 30 }}
              css={{
                borderBottom: `1px solid ${theme.colors.brightBlue600}`,
                display: "inline-block",
                "&:hover": {
                  color: theme.colors.brightBlue100,
                },
              }}
            >
              <a href="https://hydradx.io" target="_blank" rel="noreferrer">
                {t("bonds.whyBonds.link")}
                <LinkIcon height={10} sx={{ ml: 6 }} />
              </a>
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </SWhyBonds>
  )
}
